import schedule
import time
from runEachWeek import getAndSend

def job():
    getAndSend()

# UTC = Pacific + 8
schedule.every().wednesday.at("19:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
