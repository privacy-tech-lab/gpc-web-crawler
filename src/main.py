
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


test_driver = webdriver.Chrome(executable_path=path, options=options)

test_driver.get("http://www.google.com/")
info_block = test_driver.find_element(By.TAG_NAME, 'title')
webdriver_list.append(test_driver)
print(info_block.get_attribute('innerHTML'))


test_driver.quit()

