// ── Configuration ──────────────────────────────────────────────
//
// Option A — Mock data (default, no key needed):
//   USE_MOCK = true  →  loads 15 sample cards to test the UI
//
// Option B — Cloudflare Worker (production, recommended):
//   USE_MOCK = false, USE_DIRECT = false
//   Deploy cloudflare-worker.js, set PROXY_URL to your worker URL
//   e.g. PROXY_URL = 'https://riftbound-proxy.YOUR-SUBDOMAIN.workers.dev'
//
// Option C — Local Node proxy (dev only):
//   USE_MOCK = false, USE_DIRECT = false
//   npm install express  →  node proxy-server.js
//   PROXY_URL stays as '/api/riftbound-proxy', open http://localhost:3000
//
// Option D — Direct fetch (exposes key, avoid in production):
//   USE_MOCK = false, USE_DIRECT = true, fill RIOT_API_KEY below
// ───────────────────────────────────────────────────────────────

const USE_MOCK     = true;   // ← set to false once you have a product key + proxy
const USE_DIRECT   = false;
const RIOT_API_KEY = 'RGAPI-YOUR-KEY-HERE';

// ← Change this to your Cloudflare Worker URL once deployed:
//   e.g. 'https://riftbound-proxy.YOUR-SUBDOMAIN.workers.dev'
const PROXY_URL    = 'https://billowing-shape-802c.tomas-projectes.workers.dev';

const REGIONS      = ['europe', 'americas', 'asia'];

export let cardsData = [];

export function fetchCardsData(locale = 'en') {
  if (USE_MOCK)    return Promise.resolve(loadMockData());
  if (USE_DIRECT)  return fetchDirect(locale);
  return fetchViaProxy(locale);
}

// ── Mock data — real card structure from riftcodex.com ───────────
function loadMockData() {
  const mockRaw = [
    { id:'ogn-001', name:'Jinx',              classification:{ type:'Champion',  rarity:'Legendary', domain:['Chaos']         }, set:{id:'OGN',label:'Origins'}, collector_number:1,  attributes:{energy:4,might:3,power:4}, text:{plain:'[Action] When Jinx attacks, deal 1 damage to all enemies.'        }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-002', name:'Vi',                classification:{ type:'Champion',  rarity:'Legendary', domain:['Order']         }, set:{id:'OGN',label:'Origins'}, collector_number:2,  attributes:{energy:5,might:4,power:5}, text:{plain:'[Action] Vi gains +2 Might until end of turn.'                    }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-003', name:'Acceptable Losses', classification:{ type:'Spell',     rarity:'Uncommon',  domain:['Chaos']         }, set:{id:'OGN',label:'Origins'}, collector_number:3,  attributes:{energy:1,might:null,power:null}, text:{plain:'[Action] Each player kills one of their gear.'             }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Kudos Productions'}, orientation:'portrait' },
    { id:'ogn-004', name:'Hextech Rifle',     classification:{ type:'Gear',      rarity:'Rare',      domain:['Mind']          }, set:{id:'OGN',label:'Origins'}, collector_number:4,  attributes:{energy:3,might:null,power:null}, text:{plain:'Equipped unit gets +2 Power.'                              }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-005', name:'Piltover Enforcer', classification:{ type:'Unit',      rarity:'Common',    domain:['Order']         }, set:{id:'OGN',label:'Origins'}, collector_number:5,  attributes:{energy:2,might:2,power:2},    text:{plain:'When this unit enters play, draw a card.'                     }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-006', name:'Zaun Chemist',      classification:{ type:'Unit',      rarity:'Common',    domain:['Chaos']         }, set:{id:'OGN',label:'Origins'}, collector_number:6,  attributes:{energy:1,might:1,power:1},    text:{plain:'Whenever you play a Spell, this unit gets +1 Power.'           }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-007', name:'The Last Drop',     classification:{ type:'Location',  rarity:'Uncommon',  domain:['Calm']          }, set:{id:'OGN',label:'Origins'}, collector_number:7,  attributes:{energy:2,might:null,power:null}, text:{plain:'At the start of your turn, heal your champion 1.'          }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'landscape' },
    { id:'ogn-008', name:'Caitlyn',           classification:{ type:'Champion',  rarity:'Legendary', domain:['Mind']          }, set:{id:'OGN',label:'Origins'}, collector_number:8,  attributes:{energy:3,might:2,power:5},    text:{plain:'[Action] Deal 2 damage to target unit.'                       }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-009', name:'Powder Keg',        classification:{ type:'Gear',      rarity:'Common',    domain:['Chaos','Fury']  }, set:{id:'OGN',label:'Origins'}, collector_number:9,  attributes:{energy:1,might:null,power:null}, text:{plain:'When destroyed, deal 2 damage to all units.'               }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-010', name:'Ekko',              classification:{ type:'Champion',  rarity:'Epic',      domain:['Mind','Chaos']  }, set:{id:'OGN',label:'Origins'}, collector_number:10, attributes:{energy:4,might:3,power:3},    text:{plain:"[Action] Return target unit to its owner's hand."              }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-011', name:'Ambessa',           classification:{ type:'Legend',    rarity:'Legendary', domain:['Fury']          }, set:{id:'OGN',label:'Origins'}, collector_number:11, attributes:{energy:6,might:5,power:5},    text:{plain:'All friendly units gain +1 Might while Ambessa is in play.'   }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-012', name:'Meditation Garden', classification:{ type:'Location',  rarity:'Rare',      domain:['Calm','Body']   }, set:{id:'OGN',label:'Origins'}, collector_number:12, attributes:{energy:3,might:null,power:null}, text:{plain:'Units at this location gain [Barrier] when they attack.'    }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'landscape' },
    { id:'ogn-013', name:'Counter Rune',      classification:{ type:'Rune',      rarity:'Uncommon',  domain:['Order']         }, set:{id:'OGN',label:'Origins'}, collector_number:13, attributes:{energy:2,might:null,power:null}, text:{plain:'[Reaction] Cancel target Spell.'                            }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-014', name:'Street Scrapper',   classification:{ type:'Unit',      rarity:'Common',    domain:['Fury']          }, set:{id:'OGN',label:'Origins'}, collector_number:14, attributes:{energy:2,might:3,power:1},    text:{plain:'This unit can block any number of attackers.'                 }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
    { id:'ogn-015', name:'Shimmer Flask',     classification:{ type:'Gear',      rarity:'Rare',      domain:['Body']          }, set:{id:'OGN',label:'Origins'}, collector_number:15, attributes:{energy:2,might:null,power:null}, text:{plain:'[Action] Heal equipped unit for 3. Draw a card.'            }, media:{image_url:'https://cmsassets.rgpub.io/sanity/images/dsfx7636/game_data_live/b2b470bab1ae511ab9de0b1ce576e2050532a081-744x1039.png',artist:'Riot Games'}, orientation:'portrait'  },
  ];

  cardsData = mockRaw.map(mapRiftcodexCard);
  console.log(`[api] Loaded ${cardsData.length} mock cards (USE_MOCK=true)`);
  return cardsData;
}

// ── Real API fetchers ────────────────────────────────────────────

function fetchViaProxy(locale) {
  return fetch(`${PROXY_URL}?locale=${locale}`)
    .then(res => {
      if (!res.ok) throw new Error(`Proxy error ${res.status} — is proxy-server.js running at localhost:3000?`);
      return res.json();
    })
    .then(parseResponse);
}

async function fetchDirect(locale) {
  for (const region of REGIONS) {
    const url = `https://${region}.api.riotgames.com/riftbound/content/v1/contents?locale=${locale}`;
    console.log(`[api] trying ${url}`);
    try {
      const res = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY } });
      if (res.status === 403) throw new Error('403 Forbidden — personal API keys cannot access Riftbound. You need a product key.');
      if (res.status === 404) { console.warn(`[api] 404 on ${region}, trying next…`); continue; }
      if (!res.ok) throw new Error(`API error ${res.status} on ${region}: ${res.statusText}`);
      return parseResponse(await res.json());
    } catch (err) {
      if (err.message.includes('Failed to fetch'))
        throw new Error('CORS blocked — use proxy-server.js instead of direct fetch.');
      throw err;
    }
  }
  throw new Error('Riftbound API returned 404 on all regions.');
}

// ── Parsers ──────────────────────────────────────────────────────

function parseResponse(data) {
  const allCards = [];
  (data.sets || []).forEach(set => {
    (set.cards || []).forEach(card => allCards.push(mapRiotCard(card, set)));
  });
  if (!allCards.length) console.warn('[api] No cards found:', data);
  else console.log(`[api] Loaded ${allCards.length} cards`);
  cardsData = allCards;
  return cardsData;
}

// Official Riot API format
function mapRiotCard(card, set) {
  return {
    ID:          card.id || '',
    Name:        card.name || '',
    Type:        card.type || '',
    Rarity:      card.rarity || '',
    Domain:      Array.isArray(card.faction) ? card.faction : (card.faction ? [card.faction] : []),
    Set_ID:      set.id || '',
    Set_Name:    set.name || set.id || '',
    Card_Num:    card.collectorNumber || 0,
    Energy:      card.stats?.energy ?? card.cost ?? null,
    Might:       card.stats?.might ?? null,
    Power:       card.stats?.power ?? null,
    Keywords:    Array.isArray(card.keywords) ? card.keywords : [],
    Body_Text:   card.description || '',
    Flavor_Text: card.flavorText || '',
    Artist:      card.art?.artist || '',
    Image:       card.art?.fullURL || card.art?.thumbnailURL || '',
    Thumbnail:   card.art?.thumbnailURL || card.art?.fullURL || '',
    Orientation: card.orientation || 'portrait',
  };
}

// riftcodex.com format (used by mock data)
function mapRiftcodexCard(card) {
  return {
    ID:          card.id || '',
    Name:        card.name || '',
    Type:        card.classification?.type || '',
    Rarity:      card.classification?.rarity || '',
    Domain:      card.classification?.domain || [],
    Set_ID:      card.set?.id || '',
    Set_Name:    card.set?.label || '',
    Card_Num:    card.collector_number || 0,
    Energy:      card.attributes?.energy ?? null,
    Might:       card.attributes?.might ?? null,
    Power:       card.attributes?.power ?? null,
    Keywords:    card.tags || [],
    Body_Text:   card.text?.plain || '',
    Flavor_Text: '',
    Artist:      card.media?.artist || '',
    Image:       card.media?.image_url || '',
    Thumbnail:   card.media?.image_url || '',
    Orientation: card.orientation || 'portrait',
  };
}