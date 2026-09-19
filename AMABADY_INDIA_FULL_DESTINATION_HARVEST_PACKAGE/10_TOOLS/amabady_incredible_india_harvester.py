#!/usr/bin/env python3
"""
AMABADY INDIA SOURCE HARVESTER
Run locally where Internet access is available.

pip install requests beautifulsoup4 pandas lxml
python amabady_incredible_india_harvester.py

The script intentionally retains discovered names and does not apply an importance filter.
It uses the official Incredible India state pages as a discovery layer. Extend SOURCES with
state/district tourism and official religious/forest/archaeology URLs.
"""
import re, time, json, hashlib
from pathlib import Path
import requests, pandas as pd
from bs4 import BeautifulSoup

BASE="https://www.incredibleindia.gov.in/en"
OUT=Path("amabady_harvest_output"); OUT.mkdir(exist_ok=True)
RAW=OUT/"raw"; RAW.mkdir(exist_ok=True)

STATES = [
"andaman-and-nicobar-islands","andhra-pradesh","arunachal-pradesh","assam","bihar",
"chandigarh","chhattisgarh","delhi","goa","gujarat","haryana","himachal-pradesh",
"jammu-and-kashmir","jharkhand","karnataka","kerala","ladakh","madhya-pradesh",
"maharashtra","manipur","meghalaya","mizoram","nagaland","odisha","puducherry",
"punjab","rajasthan","sikkim","tamil-nadu","telangana","the-dadra-and-nagar-haveli-and-daman-and-diu",
"tripura","uttar-pradesh","uttarakhand","west-bengal","lakshadweep"
]

session=requests.Session()
session.headers.update({"User-Agent":"Amabady-Destination-Harvester/1.0"})

def clean(s):
    return re.sub(r"\s+"," ",s or "").strip()

def get(url):
    r=session.get(url,timeout=30)
    r.raise_for_status()
    return r.text

def extract_links(html, page_url):
    soup=BeautifulSoup(html,"html.parser")
    rows=[]
    for a in soup.find_all("a",href=True):
        name=clean(a.get_text(" ",strip=True))
        href=a["href"]
        if not name or len(name)<2: continue
        if href.startswith("/"): href="https://www.incredibleindia.gov.in"+href
        if href.startswith("https://www.incredibleindia.gov.in"):
            rows.append((name,href))
    return rows

all_rows=[]
for state in STATES:
    url=f"{BASE}/{state}"
    try:
        html=get(url)
        (RAW/f"{state}.html").write_text(html,encoding="utf-8")
        for name,href in extract_links(html,url):
            all_rows.append({"state_slug":state,"name":name,"url":href,"source":"Incredible India"})
        print("OK",state,len(all_rows))
    except Exception as e:
        print("ERROR",state,e)

df=pd.DataFrame(all_rows).drop_duplicates()
df.to_csv(OUT/"incredible_india_discovered_links.csv",index=False)
df.to_json(OUT/"incredible_india_discovered_links.json",orient="records",force_ascii=False,indent=2)
print("records:",len(df))
