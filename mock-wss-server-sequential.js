//const fs = require("fs");
//const https = require("https");
//const WebSocket = require("ws");
import fs from "fs";
import https from "https";
import { WebSocket } from "ws";
import http from "http";
import { WebSocketServer } from "ws";
import express from "express";


const app = express();

// normal REST route (Render needs this for health check)
app.get("/", (req, res) => {
  res.send("WebSocket server is up ✅");
});


// Create HTTP server
const server = http.createServer(app);
// Load self-signed certificate
/*const server = https.createServer({
  cert: fs.readFileSync("./ssl.crt/server.crt"),
  key: fs.readFileSync("./ssl.key/server.key")
});
*/
function getTuesdaysOfMonth(year, monthIndex) {
  // monthIndex: 0 = January, 9 = October
  const tuesdays = [];

  // Start from the 1st of the month
  let date = new Date(year, monthIndex, 1);

  // Find the first Tuesday
  while (date.getDay() !== 2) {
    date.setDate(date.getDate() + 1);
  }

  // Collect all Tuesdays in that month
  while (date.getMonth() === monthIndex) {
    tuesdays.push(new Date(date));
    date.setDate(date.getDate() + 7);
  }

  return tuesdays;
}

// Map month index → single-letter code
const monthCodes = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
// Proper month codes
const monthProperCodes = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

/**
 * Generate short expiry code from a Date
 * Example: Date(2025-10-07) → "25OCT07"
 */
function getShortYYMMDD(dateInput) {

 const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);

  if (isNaN(date)) {
    throw new Error(`Invalid date: ${dateInput}`);
  }

  const yy = String(date.getFullYear()).slice(-2);   // last 2 digits of year
  const mCode = monthCodes[date.getMonth()];         // 3-letter month
  const dd = String(date.getDate()).padStart(2, "0"); // 2-digit day
  return `${yy}${mCode}${dd}`;
}

/**
 * Generate short expiry code from a Date
 * Example: Date(2025-10-07) → "251007"
 */
function getShortYYMMDDDigits(dateInput) {

 const date = (dateInput instanceof Date) ? dateInput : new Date(dateInput);

  if (isNaN(date)) {
    throw new Error(`Invalid date: ${dateInput}`);
  }

  const yy = String(date.getFullYear()).slice(-2);   // last 2 digits of year
  const mCode =  date.getMonth()+1 < 10 ?   `0` + date.getMonth()+1 :  date.getMonth()+1 ;         // 3-letter month
  const dd = String(date.getDate()).padStart(2, "0"); // 2-digit day
  return `${yy}${mCode}${dd}`;
}




function formatTuesday(date) {
  const yy = String(date.getFullYear()).slice(-2);
  const mCode = monthCodes[date.getMonth()];
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}${mCode}${dd}`;
}

// ✅ Get current system year & month whenever script starts
const now = new Date();
const currentYear = now.getFullYear();
const currentMonthIndex = now.getMonth(); // 0 = Jan, 9 = Oct

// Example: First Tuesday of October 2025
const tuesdays = getTuesdaysOfMonth(currentYear, currentMonthIndex); // 9 = October
console.log("All Tuesdays:", tuesdays.map(formatTuesday));
console.log("First Tuesday of October 2025:", formatTuesday(tuesdays[0]));
 // === 4. Trade generator ===
  function generateTrade(id, k_const) {
    return [
      id,
      new Date().toISOString(),
      (k_const + Math.random() * 70).toFixed(2),
      "0","0","0",
      (k_const + Math.random() * 70).toFixed(2),
      (k_const + Math.random() * 70).toFixed(2),
      (k_const + Math.random() * 70).toFixed(2),
      (k_const + Math.random() * 70).toFixed(2),
      Math.floor(1000000 + Math.random() * 9000000) + "",
      Math.floor(1000000 + Math.random() * 9000000) + "",
      "0","0","0","0","0"
    ];
  }
// Build expiry → trades map
let current_month_nifty_expiries = {};
let current_month_nifty_expiries_truedata = {};
let total_array_expiries = [] ;
let total_array_expiries_truedata = [] ;
/**
 * Generate a random 9-digit integer
 */
function random9Digit() {
  return Math.floor(100000000 + Math.random() * 900000000);
}


/**
 * Generate trades for each expiry
 * @param {Array} expiries - array of { date, shortKey }
 * @param {Number} baseStrike - starting strike price
 * @param {Number} steps - how many strikes to generate
 * @param {Number} stepSize - increment per strike
 * @param {Number} weeklyInterestRate - usually 15
 */
function generateTrades(
  expiries,
  baseStrike = 26100,      // this needs to be categorised as configuration object or setting , others are at line 285 1276 
  steps = 4,
  stepSize = 100,
  weeklyInterestRate = 15
) {
  const result = {};

  expiries.forEach(exp => {
    const trades = [];

    for (let i = 0; i < steps; i++) {
      const strike = baseStrike + i * stepSize;

      // CE leg
      trades.push({
        id: String(random9Digit()),
        symbol: `NIFTY${exp.shortKey}${strike}CE`,
        k: Math.floor(Math.random() * weeklyInterestRate) + stepSize,
        expiry: exp.shortKey
      });

      // PE leg
      trades.push({
        id: String(random9Digit()),
        symbol: `NIFTY${exp.shortKey}${strike}PE`,
        k: Math.floor(Math.random() * weeklyInterestRate) + stepSize,
        expiry: exp.shortKey
      });
    }
    total_array_expiries.push([exp.shortKey ,trades ])
    result[exp.shortKey] = trades;
  });

  return result;
}

/**
 * Generate trades for each expiry
 * @param {Array} expiries - array of { date, shortKey }
 * @param {Number} baseStrike - starting strike price
 * @param {Number} steps - how many strikes to generate
 * @param {Number} stepSize - increment per strike
 * @param {Number} weeklyInterestRate - usually 15
 */
function generateTuesdayTrades(
  tuesdayObjects,
  baseStrike = 26100, // this is with relation to truedata actuall values ...
  steps = 4,
  stepSize = 100,
  weeklyInterestRate = 15
) {
  const result = {};

  tuesdayObjects.forEach(exp => {
    const trades = [];

    for (let i = 0; i < steps; i++) {
      const strike = baseStrike + i * stepSize;

      // CE leg
      trades.push({
        id: String(random9Digit()),
        symbol: `NIFTY${exp.date}${strike}CE`,
        k: Math.floor(Math.random() * weeklyInterestRate) + stepSize,
        expiry: exp.date
      });

      // PE leg
      trades.push({
        id: String(random9Digit()),
        symbol: `NIFTY${exp.date}${strike}PE`,
        k: Math.floor(Math.random() * weeklyInterestRate) + stepSize,
        expiry: exp.date
      });
    }
    total_array_expiries_truedata.push([exp.date ,trades ])
    result[exp.date] = trades;
  });

  return result;
}
 const current_month_expiries = tuesdays;
 // Map raw dates → { date, shortKey }
const expiryObjects = current_month_expiries.map(d => ({
  date: d,
  shortKey: getShortYYMMDD(d)
}));
const tuesdayObjects = current_month_expiries.map((d, indx) => ({
  date: getShortYYMMDDDigits(d),
  shortKey: indx
}));
console.log(` weekly epxiry date codes : ----------`);
expiryObjects.forEach( t => {
  console.log(`: ---------- date: ${t["date"]} shortKey: ${t["shortKey"]} `);
})

console.log(`: ---------- structure : ${JSON.stringify(expiryObjects)}   `);
current_month_nifty_expiries = generateTrades(expiryObjects);
current_month_nifty_expiries_truedata = generateTuesdayTrades(tuesdayObjects);
console.log(`current_month_nifty_expiries: ----------`);
console.log(current_month_nifty_expiries);
console.log(`current_month_nifty_expiries_truedata: ----------`);
console.log(current_month_nifty_expiries_truedata);
console.log(`total_array_expiries: ----------`);
console.log(JSON.stringify(total_array_expiries));
console.log(`total_array_expiries_truedata: ----------`);
console.log(JSON.stringify(total_array_expiries_truedata));
//console.log(`current_month_nifty_expiries: ${Array.isArray(current_month_nifty_expiries)} total: ${current_month_nifty_expiries.length}`);
console.log(`total_array_expiries: ${Array.isArray(total_array_expiries)} total: ${total_array_expiries.length}`);


// Create WebSocket server over HTTPS
const wss = new WebSocketServer({ server });// new WebSocket.Server({ server });
 let  matching_contracts = [];
wss.on("connection", (ws) => {
  console.log("[WSS] New client connected.");

  // Each client has its own subscriptions
  ws.subscribedSymbols = new Map();
   // Each client has its own state
  ws.matching_contracts = [];
   ws.aslongSubscribedInterval = null; // to track interval
   let initialtrade =[]; let idSym = []; 
const DELAY_BETWEEN_TRADES_MS = 30; // 30 mili seconds delay between individual ws.send() calls
const CYCLE_INTERVAL_MS = 9000;     // The original 17 seconds cycle

  const symbols_const = [
   /* { symbol: "NIFTY25093025300CE", id: "302418032",  },
    {symbol: "NIFTY25093025100PE",  id: "302418025"  },
    { symbol: "NIFTY25093025100CE",id: "302418024"   },
    { symbol: "NIFTY25093025200PE", id: "302418029"  }*/
     { symbol: "NIFTY25D1626000CE", id: "302418032",  },
    {symbol: "NIFTY25D1626000PE",  id: "302418025"  },
    { symbol: "NIFTY25D1626100CE",id: "302418024"   },
 	{ symbol: "NIFTY25D1626100PE", id: "302418029"  } 
    
  ];
  // === 1. Send TrueData Real Time Data Service event immediately ===
  const mockEvent0 = {
    success: true,
    message: "TrueData Real Time Data Service",
    segments: ["EQ", "FO", "IND", ""],
    maxsymbols: 50,
    subscription: "tick",
    validity: "2025-10-01T00:00:00"
  };
  ws.send(JSON.stringify(mockEvent0));
  console.log("[WSS] Sent mockEvent0 (TrueData Service)");
  /**
 * Recursively sends trades from the contracts array with a 3-second delay
 * between each individual send operation.
 * * @param {Array<Object>} contracts - The array of option contracts to send trades for.
 * @param {number} index - The current index in the contracts array.
 */
function sendDelayedTrades(contracts, index = 0) {
    // Base Case: Stop recursion when all contracts have been processed
    if (index >= contracts.length) {
        console.log(`[WSS] Finished sending all ${contracts.length} trades for the current cycle.`);
        return;
    }

    const { id, symbol, k } = contracts[index];
    
    // 1. Send the current trade immediately
    const trade = generateTrade(id, k);
    // Ensure you check the readyState here if not checked in the setInterval wrapper
    // if (ws.readyState === WebSocket.OPEN) { 
        ws.send(JSON.stringify({ trade })); 
        console.log(`[WSS] Sent trade for ${symbol} (Index ${index}):`, trade[2]);
    // } else {
    //    console.log(`[WSS] WebSocket not open, failed to send trade for ${symbol}`);
    // }

    
    // 2. Schedule the sending of the next trade after the specified delay
    setTimeout(() => {
        sendDelayedTrades(contracts, index + 1);
    }, DELAY_BETWEEN_TRADES_MS); 
}
  // === 2. Keep sending heartbeat ===
  const heartbeatInterval = setInterval(() => {
    const mockEvent1 = {
      success: true,
      message: "HeartBeat",
      timestamp: new Date().toISOString()
    };
    ws.send(JSON.stringify(mockEvent1));
    console.log("[WSS] Sent HeartBeat");
  }, 15000);
    // Start interval only after subscription
     
    const aslongSubscribedInterval = setInterval(() => {
    // if (ws.readyState !== WebSocket.OPEN) { 
    //     console.log(`[WSS] WEBSOCKET NOT OPEN, skipping cycle.`); 
    //     return; 
    // } 

    if (
        Array.isArray(matching_contracts) &&
        matching_contracts.length > 0
    ) {
        console.log(`\n--- Starting new trade cycle (Total contracts: ${matching_contracts.length}) ---`);
        // Start the recursive, delayed sending process for this 17-second cycle
        sendDelayedTrades(matching_contracts); 
    } else {
        console.log("[WSS] No contracts for client yet to send trades for.");
    } 
}, CYCLE_INTERVAL_MS);




  // === 3. Handle client messages ===
  ws.on("message", (msg) => {
    try {
      const request = JSON.parse(msg);
      console.log("[WSS] Received:", request);
     /* 
     select 
      trades_k_const.forEach(({ id, symbol, k }) => {
      if (ws.subscribedSymbols.has(symbol)) {
        const trade = generateTrade(id, k);
        ws.send(JSON.stringify({ trade }));
        console.log(`[WSS] Sent trade for ${symbol}:`, trade[2]);
      }
    });
     */

      if (request.method === "addsymbol" && Array.isArray(request.symbols)) {


         // Reset interval if already running
       // if (ws.aslongSubscribedInterval) {
        //  clearInterval(ws.aslongSubscribedInterval);
        //}
        // --- FILTERING LOGIC ---

      // 1. Convert the array of required symbols into a Set for fast O(1) lookups.
      const symbolSet = new Set(request.symbols);
      console.log(`Searching for ${symbolSet.size} unique symbols...`);

     // 2. Use flatMap to iterate through the nested structure and create a single flat array.
       matching_contracts = total_array_expiries_truedata.flatMap(expiryGroup => {
          // expiryGroup is in the format: ["expiryDate", [contract_objects...]]
          const optionsArray = expiryGroup[1];
          
          // Filter the optionsArray: keep only elements where the symbol is in our Set.
          return optionsArray.filter(option => symbolSet.has(option.symbol));
      });
      
      console.log("\n--- Matching Contracts Found ---");
      console.log(`Total matches: ${matching_contracts.length}`);
      console.log(JSON.stringify(matching_contracts, null, 2));



        // searach symbols in the generated total_array_expiries_truedata
       
        matching_contracts.forEach(({ id, symbol, k }) => {
           
            const trade = generateTrade(id, k);
            console.log(`[WSS] Initial trade for ${id}:`, JSON.stringify(trade));
             idSym.push([id , symbol]);
               initialtrade.push([symbol, ...trade]);
           // ws.send(JSON.stringify({ trade }));
           // console.log(`[WSS] Sent trade for ${symbol}:`, trade[2]);
            ws.subscribedSymbols.set(id, symbol);
        });
         ws.matching_contracts = matching_contracts;
         

       // request.symbols.forEach(sym => {
       /*     trades_k_const.forEach(({ id, symbol ,k }) => {

               const trade = generateTrade(id, k);
                 ws.send(JSON.stringify({ trade }));
                 console.log(`[WSS] Initial trade for ${id}:`, JSON.stringify(trade));
                 idSym.push([id , symbol]);

                  //trade.push(symbol);
                  initialtrade.push([symbol, ...trade]);
                 ws.subscribedSymbols.set(id, symbol);
             })
             */
        // } )
        let syml =   Array.from(ws.subscribedSymbols.entries());
         console.log(` Initial trades first array :`, JSON.stringify(initialtrade));
        // Deduplicate using Set
        const uniqueMerged = [...new Set(initialtrade)];
          console.log(` Initial trades :`, JSON.stringify(uniqueMerged));
         console.log("[WSS] Subscribed & matched contracts:", ws.matching_contracts.length);
         // ✅ build custom symbollist
       /* const symbollist1 = [];
        const firstSymbol = symbols_const[0].symbol;
        symbollist1.push(firstSymbol);                 // "NIFTY25093025300PE"
        symbollist1.push([symbols_const[0].id]);       // ["302418032"]

        // then push id + symbol pairs
        symbols_const.slice(1).forEach(({ id, symbol }) => {
        symbollist1.push([firstSymbol, id]);         // ["NIFTY25093025300PE", "302418025"]
        });*/
        // build symbollist as [symbol, id] pairs
        const symbollist_pairs = Array.from(ws.subscribedSymbols.entries()).map(
                ([symbol, id]) => [symbol, id]
            );
      
    /* trades_k_const.forEach(({ id, symbol, k }) => {
         if (ws.subscribedSymbols.has(symbol)) {
         
              syml[i].concat(initialtrade)
      }});*/
      
        // Send mockEvent2 (symbols added)
        const mockEvent2 = {
          success: true,
          message: "symbols added",
          symbolsadded: request.symbols.length,
          symbollist:initialtrade,
          totalsymbolsubscribed: ws.subscribedSymbols.size
        };
        ws.send(JSON.stringify(mockEvent2));
        console.log("[WSS] Sent mockEvent2 (symbols added):", JSON.stringify(syml));
        // INVOLE the asLongSubscribedInterval
        //aslongSubscribedInterval();
        

 
     
     
     
     
     
     
      }
    } catch (err) {
      console.error("[WSS] Error parsing message:", err.message);
      ws.send(JSON.stringify({ success: false, message: "Invalid JSON" }));
    }
  });

 
  const trades_k_const = [

        { id: "302418012", symbol: "NIFTY25D1624100CE", k: 180 },
    { id: "302518013", symbol: "NIFTY25D1625100PE", k: 40 },
    { id: "302418014", symbol: "NIFTY25D1625200PE", k: 360 },
    { id: "302418015", symbol: "NIFTY25D1625200CE", k: 60 },

    { id: "302418016", symbol: "NIFTY25D1625300CE", k: 180 },
    { id: "302418017", symbol: "NIFTY25D1625300PE", k: 40 },
    { id: "302418018", symbol: "NIFTY25D1625400PE", k: 360 },
    { id: "302418019", symbol: "NIFTY25D1625400CE", k: 60 },

     { id: "302418020", symbol: "NIFTY25D1625500CE", k: 180 },
    { id: "302418021", symbol: "NIFTY25D1625500PE", k: 40 },
    { id: "302418022", symbol: "NIFTY25D1625600PE", k: 360 },
    { id: "302518023", symbol: "NIFTY25D1625600CE", k: 60 },

    { id: "302418032", symbol: "NIFTY25D1625700CE", k: 180 },
    { id: "302418025", symbol: "NIFTY25D1625700PE", k: 40 },
    { id: "302418024", symbol: "NIFTY25D1625800PE", k: 360 },
    { id: "302418029", symbol: "NIFTY25D1625800CE", k: 60 },
    	
        { id: "302419032", symbol: "NIFTY25D1625900CE", k: 180 },
    { id: "302419025", symbol: "NIFTY25D1625900PE", k: 40 },
    { id: "302419024", symbol: "NIFTY25D1626000PE", k: 360 },
    { id: "302419029", symbol: "NIFTY25D1626000CE", k: 60 },
    			
    	 { id: "302420032", symbol: "NIFTY25D1626050CE", k: 180 },
    { id: "302420025", symbol: "NIFTY25D1626050PE", k: 40 },
    { id: "302420024", symbol: "NIFTY25D1626100PE", k: 360 },
     { id: "302420029", symbol: "NIFTY25D1626100CE", k: 60 }
  ];
 


  // === 5. Send trades every 2s for subscribed symbols ===
  /*const tradeInterval = setInterval(() => {
   console.log('generating  trades ')
    matching_contracts.forEach(({ id, symbol, k }) => {
      if (ws.subscribedSymbols.has(symbol)) {
        const trade = generateTrade(id, k);
        ws.send(JSON.stringify({ trade }));
        console.log(`[WSS] Sent trade for ${symbol}:`, trade[2]);
      }
    });
    if(Array.isArray(matching_contracts) && matching_contracts.length > 0 ){

    }else {
       console.log(' matching records to generate trades is not available  ')
    }
  }, 2000);
   */
     //5. Send trades every 2s for subscribed symbols ===
      // 2. Trade generator for THIS client
  const tradeInterval = setInterval(() => {
    if (ws.readyState !== WebSocket.OPEN) return;

    if (Array.isArray(ws.matching_contracts) && ws.matching_contracts.length > 0) {
      ws.matching_contracts.forEach(({ id, symbol, k }) => {
        if (ws.subscribedSymbols.has(symbol)) {
          const trade = generateTrade(id, k);
          ws.send(JSON.stringify({ trade }));
          console.log(`[WSS] Sent trade for ${symbol}:`, trade[2]);
        }
      });
    } else {
      console.log("[WSS] No matching records for this client");
    }
  }, 2000);






  // === 6. Cleanup on disconnect ===
  ws.on("close", () => {
    console.log("[WSS] Client disconnected.");
    clearInterval(heartbeatInterval);
    clearInterval(tradeInterval);
    clearInterval(aslongSubscribedInterval);
  });
});

// Use Render’s PORT (default to 3000 locally)
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ WebSocket endpoint: wss://<your-app>.onrender.com`);
});

/*
// Start HTTPS server
server.listen(8443, () => {
  console.log("✅ Mock WSS server running at wss://localhost:8443");
});
*/
