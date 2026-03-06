"""
config.py — Socelle Jobs Pipeline Configuration
All constants, country configs, search terms, and classification maps.
"""

import os

# ── Supabase connection ───────────────────────────────────────────
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# ── Search terms (30 terms, universal across English-speaking markets) ─
SEARCH_TERMS = [
    # US-primary terms
    "esthetician",
    "cosmetologist",
    "medspa",
    "med spa",
    "spa therapist",
    "laser technician",
    "salon manager",
    "spa director",
    "spa manager",
    "nail technician",
    "makeup artist",
    "hair stylist",
    "injector",
    "aesthetic nurse",
    "medspa nurse practitioner",
    "beauty advisor",
    "skincare specialist",
    "spa receptionist",
    "salon coordinator",
    "cosmetic surgery coordinator",
    "brand educator",
    "wellness coordinator",
    # UK/AU/international variants
    "beauty therapist",
    "hairdresser",
    "aesthetic practitioner",
    "cosmetic nurse",
    "skin therapist",
    "dermal therapist",
    "lash technician",
    "laser therapist",
]

# ── Country configurations ────────────────────────────────────────
# Each 6-hour cycle covers one country in rotation.
# Adding a country: insert a row in socelle.countries AND add a dict here.

COUNTRIES = [
    # ── Wave 0: Base ─────────────────────────────────────────────
    {
        "code": "US",
        "country_indeed": "USA",
        "currency": "USD",
        "sites": ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"],
        "primary_regions": [
            "California", "Texas", "Florida", "New York", "Illinois",
            "Pennsylvania", "Ohio", "Georgia", "North Carolina", "New Jersey",
            "Virginia", "Washington", "Arizona", "Massachusetts", "Tennessee",
            "Colorado", "Minnesota", "South Carolina", "Indiana", "Missouri",
        ],
        "secondary_regions": [
            "Maryland", "Wisconsin", "Alabama", "Louisiana", "Kentucky",
            "Oregon", "Oklahoma", "Connecticut", "Utah", "Nevada",
            "Arkansas", "Mississippi", "Kansas", "New Mexico", "Nebraska",
            "Idaho", "West Virginia", "Hawaii", "New Hampshire", "Maine",
            "Montana", "Rhode Island", "Delaware", "South Dakota", "North Dakota",
            "Alaska", "Vermont", "Wyoming", "Iowa", "Michigan",
        ],
        "national_results_wanted": 200,
        "region_results_wanted": 50,
        "wave": 0,
    },
    {
        "code": "GB",
        "country_indeed": "UK",
        "currency": "GBP",
        "sites": ["indeed", "linkedin", "glassdoor", "google"],
        "primary_regions": [
            "London", "Manchester", "Birmingham", "Leeds", "Edinburgh",
            "Glasgow", "Bristol", "Liverpool", "Newcastle", "Sheffield",
            "Nottingham", "Cardiff", "Belfast", "Brighton", "Bath",
            "Cambridge", "Oxford", "Southampton", "Reading", "York",
        ],
        "secondary_regions": [],
        "national_results_wanted": 100,
        "region_results_wanted": 30,
        "wave": 0,
    },
    {
        "code": "CA",
        "country_indeed": "Canada",
        "currency": "CAD",
        "sites": ["indeed", "linkedin", "zip_recruiter", "glassdoor", "google"],
        "primary_regions": [
            "Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton",
            "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Halifax",
            "Victoria", "Kelowna", "Mississauga", "Brampton", "Surrey",
        ],
        "secondary_regions": [],
        "national_results_wanted": 100,
        "region_results_wanted": 30,
        "wave": 0,
    },
    {
        "code": "AU",
        "country_indeed": "Australia",
        "currency": "AUD",
        "sites": ["indeed", "linkedin", "glassdoor", "google"],
        "primary_regions": [
            "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide",
            "Gold Coast", "Canberra", "Hobart", "Darwin", "Newcastle",
            "Sunshine Coast", "Cairns", "Wollongong", "Geelong", "Byron Bay",
        ],
        "secondary_regions": [],
        "national_results_wanted": 100,
        "region_results_wanted": 30,
        "wave": 0,
    },
    # ── Wave 1 ────────────────────────────────────────────────────
    {
        "code": "IE",
        "country_indeed": "Ireland",
        "currency": "EUR",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Dublin", "Cork", "Galway", "Limerick", "Waterford"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 1,
    },
    {
        "code": "NZ",
        "country_indeed": "New Zealand",
        "currency": "NZD",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Auckland", "Wellington", "Christchurch", "Queenstown", "Hamilton"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 1,
    },
    {
        "code": "SG",
        "country_indeed": "Singapore",
        "currency": "SGD",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Singapore"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 1,
    },
    {
        "code": "AE",
        "country_indeed": "UAE",
        "currency": "AED",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Dubai", "Abu Dhabi", "Sharjah"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 1,
    },
    {
        "code": "HK",
        "country_indeed": "Hong Kong",
        "currency": "HKD",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Hong Kong"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 1,
    },
    {
        "code": "ZA",
        "country_indeed": "South Africa",
        "currency": "ZAR",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Cape Town", "Johannesburg", "Durban", "Pretoria", "Stellenbosch"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 1,
    },
    # ── Wave 2 ────────────────────────────────────────────────────
    {
        "code": "NL",
        "country_indeed": "Netherlands",
        "currency": "EUR",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 2,
    },
    {
        "code": "DE",
        "country_indeed": "Germany",
        "currency": "EUR",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Düsseldorf"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 2,
    },
    {
        "code": "SE",
        "country_indeed": "Sweden",
        "currency": "SEK",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Stockholm", "Gothenburg", "Malmö"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 2,
    },
    {
        "code": "NO",
        "country_indeed": "Norway",
        "currency": "NOK",
        "sites": ["indeed", "google", "linkedin"],
        "primary_regions": ["Oslo", "Bergen", "Stavanger"],
        "secondary_regions": [],
        "national_results_wanted": 50,
        "region_results_wanted": 20,
        "wave": 2,
    },
]

# ── Source priority for deduplication ─────────────────────────────
# Lower index = higher priority
SOURCE_PRIORITY = [
    "career_page",
    "google",
    "indeed",
    "linkedin",
    "zip_recruiter",
    "glassdoor",
    "niche_board",
    "jobspy",
]

# ── Beauty vertical classification ────────────────────────────────
BEAUTY_VERTICALS = {
    "spa": [
        "spa director", "spa manager", "spa therapist", "spa coordinator",
        "spa receptionist", "massage therapist", "massage envy", "hand and stone",
        "day spa", "resort spa",
    ],
    "medspa": [
        "medspa", "med spa", "aesthetic nurse", "injector", "laser tech",
        "nurse practitioner aesthet", "aesthetic injector", "laser specialist",
        "ipl technician", "coolsculpting", "botox", "filler injector",
        "aesthetic practitioner", "cosmetic nurse", "aesthetic clinic",
    ],
    "skincare": [
        "esthetician", "aesthetician", "skincare specialist", "facial",
        "skin care", "licensed esthetician", "medical esthetician",
        "skin therapist", "dermal therapist",
    ],
    "hair_salon": [
        "hair stylist", "cosmetologist", "colorist", "salon manager",
        "salon director", "barber", "salon coordinator", "hairdresser",
        "hair color", "hair therapist", "trichologist",
    ],
    "makeup": [
        "makeup artist", "beauty advisor", "cosmetic consultant",
        "beauty consultant", "mua", "makeup counter", "beauty therapist",
    ],
    "wellness": [
        "wellness coordinator", "holistic", "wellness director",
        "wellness coach", "health coach", "integrative", "spa wellness",
    ],
    "cosmetic_surgery": [
        "cosmetic surgery", "plastic surgery", "surgical coordinator",
        "dermatology", "cosmetic dermatology", "patient coordinator cosmetic",
        "aesthetic practice",
    ],
    "beauty_tech": [
        "beauty tech", "aesthetic device", "laser company",
        "medical device aesthetics", "aesthetic equipment",
    ],
    "brand": [
        "brand educator", "brand ambassador", "territory manager beauty",
        "beauty brand", "skincare brand", "cosmetics company",
    ],
}

# ── Role category classification ──────────────────────────────────
ROLE_CATEGORIES = {
    "esthetician": ["esthetician", "aesthetician", "skincare specialist", "skin therapist", "dermal therapist"],
    "cosmetologist": ["cosmetologist", "beauty therapist", "hairdresser"],
    "injector": ["injector", "nurse injector", "aesthetic injector", "botox", "filler"],
    "laser_tech": ["laser tech", "laser specialist", "ipl", "laser hair removal", "coolsculpting", "laser therapist"],
    "spa_director": ["spa director", "spa manager", "wellness director"],
    "salon_manager": ["salon manager", "salon director", "salon coordinator"],
    "nurse_practitioner": ["nurse practitioner", "aesthetic np", "medspa np", "np aesthet", "cosmetic nurse", "aesthetic practitioner"],
    "makeup_artist": ["makeup artist", "mua", "beauty advisor"],
    "nail_tech": ["nail tech", "manicurist", "nail artist", "nail technician", "lash technician"],
    "hair_stylist": ["hair stylist", "hairdresser", "colorist", "barber", "hair therapist"],
    "receptionist": ["spa receptionist", "salon receptionist", "front desk spa"],
    "brand_educator": ["brand educator", "brand ambassador", "territory manager"],
    "surgical_coordinator": ["surgical coordinator", "patient coordinator cosmetic"],
    "massage_therapist": ["massage therapist", "lmt", "licensed massage"],
    "wellness_coach": ["wellness coordinator", "wellness coach", "health coach"],
}

# ── Direct employer career pages (Agent J2) ───────────────────────
CAREER_PAGES = [
    {"name": "Massage Envy",      "careers_url": "https://jobs.massageenvy.com/",                "method": "json_ld",   "verticals": ["spa", "wellness"]},
    {"name": "Hand & Stone",      "careers_url": "https://www.handandstone.com/careers/",         "method": "json_ld",   "verticals": ["spa", "skincare"]},
    {"name": "European Wax Center","careers_url": "https://waxcenter.com/careers",                "method": "json_ld",   "verticals": ["skincare"]},
    {"name": "SkinSpirit",        "careers_url": "https://www.skinspirit.com/careers",            "method": "html_parse","verticals": ["medspa", "skincare"]},
    {"name": "Ideal Image",       "careers_url": "https://www.idealimage.com/careers",            "method": "json_ld",   "verticals": ["medspa"]},
    {"name": "LaserAway",         "careers_url": "https://www.laseraway.com/careers/",            "method": "html_parse","verticals": ["medspa"]},
    {"name": "Ulta Beauty",       "careers_url": "https://careers.ulta.com/",                     "method": "ats_api",   "ats_type": "greenhouse", "ats_slug": "ulta",     "verticals": ["makeup", "skincare", "hair_salon"]},
    {"name": "Sephora",           "careers_url": "https://www.sephora.com/beauty/careers",        "method": "ats_api",   "ats_type": "greenhouse", "ats_slug": "sephora",  "verticals": ["makeup", "skincare"]},
    {"name": "Drybar",            "careers_url": "https://www.thedrybar.com/careers",             "method": "html_parse","verticals": ["hair_salon"]},
    {"name": "Madison Reed",      "careers_url": "https://www.madison-reed.com/careers",          "method": "json_ld",   "verticals": ["hair_salon"]},
    {"name": "Heyday Skincare",   "careers_url": "https://www.heydayskincare.com/careers",        "method": "html_parse","verticals": ["skincare"]},
    {"name": "Bluemercury",       "careers_url": "https://bluemercury.com/pages/careers",         "method": "html_parse","verticals": ["skincare", "makeup"]},
    {"name": "Woodhouse Spa",     "careers_url": "https://www.woodhousespas.com/careers",         "method": "html_parse","verticals": ["spa"]},
    {"name": "Great Clips",       "careers_url": "https://jobs.greatclips.com/",                  "method": "json_ld",   "verticals": ["hair_salon"]},
    {"name": "Equinox",           "careers_url": "https://careers.equinox.com/",                  "method": "ats_api",   "ats_type": "greenhouse", "ats_slug": "equinox",  "verticals": ["spa", "wellness"]},
]

# ── Niche beauty job boards (Agent J3) ───────────────────────────
NICHE_BOARDS = [
    {
        "name": "Behind the Chair Jobs",
        "url": "https://www.behindthechair.com/jobs/",
        "verticals": ["hair_salon"],
        "selectors": {"job_card": ".job-listing, article.job, .jobs-list-item", "title": "h2, h3, .job-title", "location": ".location, .job-location", "link": "a"},
    },
    {
        "name": "ASCP Career Center",
        "url": "https://www.ascpskincare.com/career-center",
        "verticals": ["skincare", "spa"],
        "selectors": {"job_card": ".job-posting, .career-listing, .job-item", "title": "h2, h3, .title", "location": ".location", "link": "a"},
    },
    {
        "name": "AmSpa Career Center",
        "url": "https://www.americanmedspa.org/page/careercenter",
        "verticals": ["medspa"],
        "selectors": {"job_card": ".job-posting, .career-item, li.job", "title": "h2, h3, strong", "location": ".location", "link": "a"},
    },
    {
        "name": "SpaStaff.com",
        "url": "https://spastaff.com/jobs/",
        "verticals": ["spa", "wellness"],
        "selectors": {"job_card": ".job-listing, .spa-job, article", "title": "h2, h3, .job-title", "location": ".location, .city", "link": "a"},
    },
    {
        "name": "Beauty Schools Directory Jobs",
        "url": "https://www.beautyschoolsdirectory.com/jobs",
        "verticals": ["skincare", "hair_salon", "makeup"],
        "selectors": {"job_card": ".job-card, .listing-item, .job", "title": "h2, h3, .title", "location": ".location", "link": "a"},
    },
    {
        "name": "Spa-Elite.com",
        "url": "https://spa-elite.com/find-a-job",
        "verticals": ["spa"],
        "selectors": {"job_card": ".job-listing, .position, article", "title": "h2, h3", "location": ".location, .city", "link": "a"},
    },
]
