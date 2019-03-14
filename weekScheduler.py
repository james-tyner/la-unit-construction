import schedule
import time
from runEachWeek import getAndSend

def job():
    getAndSend()

# UTC = Pacific Date Time + 7
schedule.every().wednesday.at("18:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
