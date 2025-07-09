import requests

SEMAPHORE_API_KEY = 'removed api key for safety purposes(please do not commit api key)'  # Consider using environment variables
SEMAPHORE_SENDER_NAME = 'removed sender name for safety purposes'  # Use your registered sender name
SEMAPHORE_URL = 'https://api.semaphore.co/api/v4/messages'

def send_sms(phone_number, message):
    payload = {
        'apikey': SEMAPHORE_API_KEY,
        'number': phone_number,
        'message': message,
        'sendername': SEMAPHORE_SENDER_NAME
    }
    response = requests.post(SEMAPHORE_URL, data=payload)
    return response
