####################################################
# this file uses the full set of sites and the sites that were redone (replacing original sies with redo domains)
# for all sites, we ping <https://example-site.com>/well-known/gpc.json
# using python's requests library to check if well-known/gpc.json exists
# the output is a csv with 3 columns: Site URL, request status, json data
# it also outputs an error json file that logs all the errors.
# each site prints the reason (basically the request status in words) as well as the
# first 500 chars of the request text to the terminal. This helps diagnose errors.

# run using: python3 well-known-collection.py
# with the sites csv files in the same directory

####################################################
# errors like "Expecting value: line 1 column 1 (char 0)", mean that the status
# was 200 (i.e. site exists and loaded) but it didn't find a json
# this happens when sites send all incorrect links to a generic error page
# instead of not serving the page. Also, it seems like human check error sites are the ones that time out

import requests
import pandas as pd
import json
import time
import os
import csv

TEST_CRAWL = os.environ["TEST_CRAWL"]
TIMESTAMP = os.environ["TIMESTAMP"]
CRAWL_ID = os.environ["CRAWL_ID"] if "CRAWL_ID" in os.environ else -1
print(TEST_CRAWL)
print(TIMESTAMP)
print(CRAWL_ID)
csv_path = "./crawl-sets/"
if TEST_CRAWL == "true":
    csv_path += "sites.csv"
else:
    csv_path += f"crawl-set-parts/crawl-set-pt{CRAWL_ID}.csv"

# read in the full site set, redo original sites, and redo sites #####
# we want to analyze the full crawl set with the redo sites replaced (i.e. they don't have a subdomain) ####
sites_df = pd.read_csv(csv_path)['Site URL'].tolist()

sites_list = sites_df.copy()

errors = {}

full_ts = time.time()


if TEST_CRAWL == "true":
    save_path = f"./crawl_results/CUSTOMCRAWL-{TIMESTAMP}"
else:
    save_path = f"./crawl_results/CRAWLSET{CRAWL_ID}-{TIMESTAMP}"
save_path += "/well-known-data.csv"
with open(save_path, "a") as f:
    csv_writer = csv.writer(f, quoting=csv.QUOTE_ALL)
    for site_idx, site in enumerate(sites_list):
        ts = time.time()
        print(site_idx, site)
        try:
            r = requests.get(
                site + "/.well-known/gpc.json", timeout=35
            )  # to stay consistent with crawler timeouts
            print("reason: ", r.reason)
            print("request text:", r.text[0:500])
            if r.status_code == 200:
                csv_writer.writerow([site, r.status_code, json.dumps(r.json())])
            else:
                csv_writer.writerow([site, r.status_code])
        # if the request.get doesn't finish in 35 seconds, this runs.
        except requests.exceptions.Timeout as e:
            print("Timed Out")
            csv_writer.writerow([site, None, None])
            errors[site] = str(e)
        # this block runs when status is 200 but r.json() is not json data
        # the "Expecting value: line 1 column 1 (char 0)", mean that the status ..." error will appear in the error logging json
        except requests.exceptions.RequestException as e:
            csv_writer.writerow([site, r.status_code, None])
            errors[site] = str(e)
        print(
            "time for the site:",
            time.time() - ts,
            "  total time elapsed",
            time.time() - full_ts,
        )

# Convert and write JSON object containing errors to file
with open("well-known-errors.json", "w") as outfile:
    json.dump(errors, outfile)
