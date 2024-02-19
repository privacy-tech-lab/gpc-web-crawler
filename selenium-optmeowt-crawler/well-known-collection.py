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

##### read in the full site set, redo original sites, and redo sites #####
##### we want to analyze the full crawl set with the redo sites replaced (i.e. they don't have a subdomain) ####
sites_df = pd.read_csv('./full-crawl-set.csv')
redo_original_sites = pd.read_csv('./redo-original-sites.csv')
redo_new_sites = pd.read_csv('./redo-sites.csv')

redo_original_sites = redo_original_sites['Original Site URL'].tolist()
redo_new_sites = redo_new_sites['Site URL'].tolist()
sites_df = sites_df['Site URL'].tolist()

sites_list = sites_df.copy()

for idx in range(len(redo_original_sites)):
    if redo_original_sites[idx] in sites_df: #this should always be true
        x = sites_df.index(redo_original_sites[idx]) # get the index of the site we want to change
        sites_list[x] = redo_new_sites[idx] # replace the site with the new site

errors = {}

full_ts = time.time()

file_to_save = 'well-known-data.csv'
for site_idx in range(len(sites_list)):
    ts = time.time()
    print(site_idx, sites_df[site_idx])
    try:
        r = requests.get(sites_df[site_idx] + '/.well-known/gpc.json', timeout=35) # to stay consistent with crawler timeouts
        print("reason: ", r.reason)
        print("request text:",r.text[0:500])
        if r.status_code == 200:
            # if there will be json data, log that
            with open(file_to_save, "a") as file1:
                # Writing data to a file: site, status, json data
                file1.write(sites_df[site_idx] + "," + str(r.status_code) + ',"' + str(r.json()) + '"\n')
        else:
            with open(file_to_save, "a") as file1:
                # no json data, just log the status and site 
                file1.write(sites_df[site_idx] + "," + str(r.status_code) + ",None\n")
        r.close() #close connection
    # if the request.get doesn't finish in 35 seconds, this runs.
    except requests.exceptions.Timeout as e:
        print("Timed Out")
        with open(file_to_save, "a") as file1:
            # error -> only log site
            file1.write(sites_df[site_idx]+",None,None\n")
        errors[sites_df[site_idx]] = str(e) # store errors with original links

    # this block runs when status is 200 but r.json() is not json data
    # the "Expecting value: line 1 column 1 (char 0)", mean that the status ..." error will appear in the error logging json
    except requests.exceptions.RequestException as e:
        r.close() #close connection
        with open(file_to_save, "a") as file1:
            # error -> only log site and status
            file1.write(sites_df[site_idx] + "," + str(r.status_code) + ",None\n")
        errors[sites_df[site_idx]] = str(e) # store errors with original links
    print("time for the site:", time.time()-ts, "  total time elapsed", time.time()- full_ts)

# Convert and write JSON object containing errors to file
with open("well-known-errors.json", "w") as outfile:
    json.dump(errors, outfile)
