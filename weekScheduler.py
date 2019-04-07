import schedule
import time
import datetime
from runEachWeek import getAndSend

def job():
    getAndSend()
    print("Program executed at", datetime.datetime.now())

# UTC = Pacific Date Time + 7
schedule.every().wednesday.at("18:00").do(job)

while True:
    schedule.run_pending()
    time.sleep(1)
