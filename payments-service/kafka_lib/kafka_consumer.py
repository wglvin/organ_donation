import json
import logging
from kafka import KafkaConsumer
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_GROUP_ID = os.getenv('KAFKA_GROUP_ID', 'payment-service-group')
KAFKA_BID_TOPIC = os.getenv('KAFKA_BID_TOPIC', 'successful-bids')
KAFKA_BID_UPDATES_TOPIC = os.getenv('KAFKA_BID_UPDATES_TOPIC', 'bid-updates')

consumer = None

def connect_consumer(topics):
    """Connect to Kafka and return the consumer instance."""
    global consumer
    if consumer is not None:
        return consumer

    try:
        logger.info(f"Connecting to Kafka at {KAFKA_BOOTSTRAP_SERVERS}")
        logger.info(f"Subscribing to topics: {topics}")
        consumer = KafkaConsumer(
            *topics,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            group_id=KAFKA_GROUP_ID,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            value_deserializer=lambda x: json.loads(x.decode('utf-8')) if x else None
        )
        logger.info("Kafka consumer connected successfully")
        return consumer

    except Exception as e:
        logger.error(f"Failed to connect Kafka consumer: {e}")
        return None

def process_message(message):
    """Process a message received from Kafka."""
    try:
        topic = message.topic
        value = message.value
        logger.info(f"Processing message from topic: {topic}")
        logger.info(f"Message: {json.dumps(value, indent=2)}")
        if topic == KAFKA_BID_TOPIC:
            handle_successful_bid(value)
        elif topic == KAFKA_BID_UPDATES_TOPIC:
            handle_bid_update(value)
    except Exception as e:
        logger.error(f"Error processing message: {e}")

def handle_successful_bid(message):
    """Handle a successful bid event."""
    try:
        event_type = message.get('event_type')
        bid_id = message.get('bid_id')
        logger.info(f"Handling successful bid: {bid_id}, event type: {event_type}")
        # Add your business logic here
    except Exception as e:
        logger.error(f"Error handling successful bid: {e}")

def handle_bid_update(message):
    """Handle a bid update event."""
    try:
        event_type = message.get('event_type')
        bid_id = message.get('bid_id')
        new_status = message.get('new_status')
        logger.info(f"Handling bid update: {bid_id}, new status: {new_status}")
        # Add your business logic here
    except Exception as e:
        logger.error(f"Error handling bid update: {e}")

def start_consumer():
    """Start consuming messages from Kafka."""
    topics = [KAFKA_BID_TOPIC, KAFKA_BID_UPDATES_TOPIC]
    kafka_consumer = connect_consumer(topics)
    if kafka_consumer is None:
        logger.error("Failed to start Kafka consumer")
        return
    logger.info("Starting to consume messages...")
    try:
        for message in kafka_consumer:
            process_message(message)
    except KeyboardInterrupt:
        logger.info("Consumer stopped by user")
    except Exception as e:
        logger.error(f"Error consuming messages: {e}")
    finally:
        if kafka_consumer is not None:
            kafka_consumer.close()
            logger.info("Kafka consumer closed")

if __name__ == '__main__':
    start_consumer()
