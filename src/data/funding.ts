export interface FundingSource {
  id: string;
  name: string;
  url: string;
  logo?: string;
  grantNumber?: string;
  amount?: string;
  duration?: string;
}

export const fundingSources: FundingSource[] = [
  {
    "id": "nsf-grant",
    "name": "National Science Foundation",
    "url": "https://www.nsf.gov",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/7/7e/NSF_logo.png",
    "grantNumber": "NSF-2318549",
    "amount": "USD 361,441",
    "duration": "2023–2026"
  },
  {
    "id": "nih-grant",
    "name": "German Research Foundation",
    "url": "https://www.dfg.de/",
    "logo": "https://www.research-in-germany.org/dam/jcr:ff526773-07f4-444e-a634-d991bf8ad0e3/DFG%20logo.png",
    "grantNumber": "NIH-R01-AB123456",
    "amount": "EUR 270,483",
    "duration": "2025–2028"
  },
  {
    "id": "research-foundation",
    "name": "Lower Saxony Ministry of Science and Culture",
    "url": "https://www.mwk.niedersachsen.de/startseite/",
    "logo": "https://www.niedersachsen.de/assets/image/736/17813",
    "duration": "2025"
  },
  {
    "id": "funding-1744664274715",
    "name": "Schmidt Science Fellows",
    "url": "https://schmidtsciencefellows.org/",
    "logo": "https://schmidtsciencefellows.org/wp-content/uploads/ssf-logomark.png",
    "amount": "USD 4000",
    "duration": "2024-2025"
  }
];