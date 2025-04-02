const { Resolution } = require('../models');
const axios = require('axios');
const resolutionService = require('../services/resolutionService');
const { executeQuery, biddingPool } = require('../config/database');


// Get all resolutions
exports.getAllResolutions = async (req, res) => {
  try {
    const resolutions = await Resolution.findAll();
    return res.status(200).json(resolutions);
  } catch (error) {
    console.error('Error fetching resolutions:', error);
    return res.status(500).json({ message: 'Failed to fetch resolutions', error: error.message });
  }
};

// Get resolution by ID
exports.getResolutionById = async (req, res) => {
  try {
    const resolution = await Resolution.findByPk(req.params.id);
    
    if (!resolution) {
      return res.status(404).json({ message: 'Resolution not found' });
    }
    
    return res.status(200).json(resolution);
  } catch (error) {
    console.error('Error fetching resolution:', error);
    return res.status(500).json({ message: 'Failed to fetch resolution', error: error.message });
  }
};

// Get resolution by listing ID
exports.getResolutionByListingId = async (req, res) => {
  try {
    const resolution = await Resolution.findByListingId(req.params.listingId);
    
    if (!resolution) {
      return res.status(404).json({ message: 'Resolution not found for this listing' });
    }
    
    return res.status(200).json(resolution);
  } catch (error) {
    console.error('Error fetching resolution by listing ID:', error);
    return res.status(500).json({ message: 'Failed to fetch resolution', error: error.message });
  }
};

// Resolve a listing manually
exports.resolveListingManually = async (req, res) => {
  try {
    const { listingId } = req.params;
    
    // Check if the listing is already resolved
    const existingResolution = await Resolution.findByListingId(listingId);
    if (existingResolution) {
      return res.status(400).json({ message: 'Listing is already resolved' });
    }
    
    // Get the listing details from the listing service
    const listingServiceUrl = process.env.LISTING_SERVICE_URL;
    const listingResponse = await axios.get(`${listingServiceUrl}/api/listings/${listingId}`);
    
    if (!listingResponse.data) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const listing = listingResponse.data;
    
    // Get the highest bid from the bidding service
    const biddingServiceUrl = process.env.BIDDING_SERVICE_URL;
    const bidsResponse = await axios.get(`${biddingServiceUrl}/api/bids/highest/${listingId}`);
    
    // Create resolution record
    const resolutionData = {};
    
    if (bidsResponse.data && bidsResponse.data.highestBid) {
      const highestBid = bidsResponse.data.highestBid;
      
      // Update the bid status to accepted
      await axios.post(`${biddingServiceUrl}/api/bids/${highestBid.id}/accept`);
      
      // Create resolution with winning bid
      resolutionData.listing_id = parseInt(listingId);
      resolutionData.status = 'accepted';
      resolutionData.winning_bid = parseFloat(highestBid.amount);
      resolutionData.winner_id = highestBid.bidderId;
      
      // Update the listing status to completed
      await axios.put(`${listingServiceUrl}/api/listings/${listingId}`, {
        status: 'completed'
      });
    } else {
      // No bids, create resolution with cancelled status
      resolutionData.listing_id = parseInt(listingId);
      resolutionData.status = 'cancelled';
      resolutionData.winning_bid = 0;
      resolutionData.winner_id = 0;
      
      // Update the listing status to cancelled
      await axios.put(`${listingServiceUrl}/api/listings/${listingId}`, {
        status: 'cancelled'
      });
    }
    
    // Save resolution
    const resolution = await Resolution.create(resolutionData);
    
    return res.status(201).json({
      message: 'Listing resolved successfully',
      resolution
    });
  } catch (error) {
    console.error('Error resolving listing:', error);
    return res.status(500).json({ message: 'Failed to resolve listing', error: error.message });
  }
};

// Trigger resolution for all expired listings
exports.resolveExpiredListings = async (req, res) => {
  try {
    // Call service method to resolve all expired listings
    const results = await resolutionService.resolveExpiredListings();
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error resolving expired listings:', error);
    return res.status(500).json({ message: 'Failed to resolve expired listings', error: error.message });
  }
};


// Accept a bid and create resolution
exports.acceptBid = async (req, res) => {
  try {
    const { bidId, listingId } = req.body;

    if (!bidId || !listingId) {
      return res.status(400).json({ message: 'Missing required fields: bidId and listingId' });
    }

    // Check if listing is already resolved
    const existingResolution = await Resolution.findByListingId(listingId);
    if (existingResolution) {
      return res.status(400).json({ message: `Listing ${listingId} is already resolved` });
    }

    // Get bid details from bid service
    const biddingServiceUrl = process.env.BIDDING_SERVICE_URL;
    const bidResponse = await axios.get(`${biddingServiceUrl}/api/bids/${bidId}`);
    const bid = bidResponse.data;

    if (!bid) {
      return res.status(404).json({ message: 'Bid not found' });
    }

    await executeQuery(
      biddingPool,
      'UPDATE bids SET status = "accepted" WHERE id = ?',
      [bidId]
    );
    
    await executeQuery(
      biddingPool,
      'UPDATE bids SET status = "cancelled" WHERE listingId = ? AND id != ?',
      [listingId, bidId]
    );
    

    // Create resolution record
    const resolutionData = {
      listing_id: listingId,
      status: 'early',
      winning_bid: parseFloat(bid.amount),
      winner_id: bid.bidderId
    };

    const resolution = await Resolution.create(resolutionData);
    
    const listingServiceUrl = process.env.LISTING_SERVICE_URL;

    await axios.put(`${listingServiceUrl}/api/listings/${listingId}`, {
      status: 'ended'
    });
    
    // Send notification if email headers are present
    const email = req.headers['x-user-email'];
    const username = req.headers['x-user-name'];

    if (email) {
      try {
        await axios.post(`http://notification:3000/notify/email`, {
          email,
          subject: 'Bid Accepted',
          text: `Hello ${username || 'there'},\n\nYour bid of $${bid.amount} has been accepted.\n\nThank you for using our service!`
        });
      } catch (notifyError) {
        console.error('Failed to send notification:', notifyError.message);
        // Don’t block resolution flow if notification fails
      }
    }

    return res.status(200).json({
      message: 'Bid accepted and resolution created successfully',
      resolution
    });
  } catch (error) {
    console.error('Error accepting bid:', error);
    return res.status(500).json({
      message: 'Failed to accept bid and create resolution',
      error: error.message
    });
  }
};
