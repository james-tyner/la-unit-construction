from datetime import datetime
import os
from runEachWeek import getAndSend

from apscheduler.schedulers.blocking import BlockingScheduler


def tick():
    getAndSend()
    print('Tick! The time is: %s' % datetime.now())


if __name__ == '__main__':
    scheduler = BlockingScheduler()
    scheduler.add_job(tick, 'cron', day_of_week='wed', hour=11, minute=0)
    print('Press Ctrl+{0} to exit'.format('Break' if os.name == 'nt' else 'C'))

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass
