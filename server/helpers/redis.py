import redis
import os

def get_redis():
	return redis.Redis(
		host=os.getenv('REDIS_HOST'),
		port=int(os.getenv('REDIS_PORT')),
		password=os.getenv('REDIS_PASSWORD'),
		charset='utf-8',
		decode_responses=True
	)
