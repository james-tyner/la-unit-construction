from apscheduler.schedulers.blocking import BlockingScheduler

sched = BlockingScheduler()

@sched.get_data('cron', day_of_week='wed', hour=11)
def get_data():
    import lib.createTableProjects # drop the projects table and recreate it
    import lib.obtainData # fill in the projects table
    import lib.calculateYearlyUnits # update the number of units per year

@sched.send_emails('cron', day_of_week='wed', hour=11, minute=30)
def send_emails():
    import runSendEmail

sched.start()
