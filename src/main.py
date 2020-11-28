
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options  # for suppressing the browser head
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
import atexit
from pathlib import Path
import os
import csv
import re




"""
Creates a webdriver to run the scraping in
"""
options = webdriver.ChromeOptions()
options.add_argument('--no-proxy-server')
options.add_argument('headless')
options.add_argument('log-level=3') # Suppresses error messages



"""
Create the path of the chromedriver
"""
abspath = Path(os.path.abspath(''))
path = abspath / 'chromedriver'
print(path)


"""
Create a gloabl webdriver list, which all webdrivers should be appended to
so that all webdrivers must be quit before ending the program. This ensures
that loose webdrivers don't hang around taking up RAM.
"""

webdriver_list = []

#Ensure the webdrivers quit. TRY TO USE A WITH STATEMENT WITH WEBDRIVERS QUIT AS THE __EXIT__ METHOD
def quit_webdrivers():
    for instance in webdriver_list:
        instance.quit()
    print('webdrivers quit')
    
atexit.register(quit_webdrivers)

"""
Create a webdriver
"""

test_driver = webdriver.Chrome(executable_path=path, options=options)
webdriver_list.append(test_driver)
test_driver.set_page_load_timeout(30)


dict_data = []

def AnalyzePage(url, driver):
    global dict_data
    driver.get(url)
    dict_data.append({'url': url, 'text': CheckForDNS(driver)})


def CheckForDNS(driver):  
    src = driver.page_source
    text_found = re.search(r'Do Not Sell', src)
    if text_found is not None:
        text_found = True
    else:
        text_found = False
    print(text_found)
    return str(text_found)

def CreateCSV(dict_data):
    csv_columns = ['url','text']
    with open("domain_analysis_output.csv", 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=csv_columns)
        writer.writeheader()
        for data in dict_data:
            writer.writerow(data)

"""
Import csv of top 500 websites
"""

with open("top500Domains.csv", newline="") as f:
    reader = csv.reader(f)
    for i, row in enumerate(reader):
        if i == 200:
            break
        if row[1] == 'Root Domain':
            pass
        else:
            try:

                print(row[1])
                AnalyzePage("https://" + row[1], test_driver)
                # info_block = test_driver.find_element(By.TAG_NAME, 'title')
                # print(info_block.get_attribute('innerHTML'))
            except Exception as inst:
                print(inst)
    CreateCSV(dict_data)


test_driver.quit()



