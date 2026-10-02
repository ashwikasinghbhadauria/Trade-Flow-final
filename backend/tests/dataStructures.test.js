/**
 * dataStructures.test.js — Comprehensive Unit Tests for Data Structures
 * 
 * Verifies:
 * 1. MaxHeap (Buy Orders, Price-Time priority)
 * 2. MinHeap (Sell Orders, Price-Time priority)
 * 3. OrderBook (Depth, Spread, Level grouping)
 * 4. MatchingEngine:
 *    - Test 1: Basic BUY/SELL matching
 *    - Test 2: Partial fill
 *    - Test 3: Multiple orders / price levels
 *    - Test 4: Price priority
 *    - Test 5: Time priority (Tie-breaking)
 *    - Test 6: Order cancellation
 *    - Test 7: No-match scenario (Spread maintained)
 */

import { MaxHeap } from '../dataStructures/MaxHeap.js';
import { MinHeap } from '../dataStructures/MinHeap.js';
import { OrderBook } from '../dataStructures/OrderBook.js';
import { MatchingEngine } from '../dataStructures/MatchingEngine.js';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

function runAllTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING DATA STRUCTURES TEST SUITE');
  console.log('========================================\n');

  // ----------------------------------------------------
  // SECTION 1: MaxHeap Tests
  // ----------------------------------------------------
  console.log('--- SECTION 1: MaxHeap (BUY Orders) ---');
  const maxHeap = new MaxHeap();
  const t0 = new Date('2026-10-01T10:00:00Z');
  const t1 = new Date('2026-10-01T10:00:01Z');
  const t2 = new Date('2026-10-01T10:00:02Z');

  maxHeap.insert({ orderId: 'B1', price: 1240, timestamp: t0 });
  maxHeap.insert({ orderId: 'B2', price: 1250, timestamp: t1 });
  maxHeap.insert({ orderId: 'B3', price: 1245, timestamp: t2 });
  maxHeap.insert({ orderId: 'B4', price: 1250, timestamp: t0 }); // Same price as B2, but earlier timestamp

  assert(maxHeap.size() === 4, 'MaxHeap size is 4');
  // B4 (1250 @ t0) should have higher priority than B2 (1250 @ t1)
  const firstBuy = maxHeap.extractMax();
  assert(firstBuy.orderId === 'B4', 'MaxHeap extracted highest price + earliest time (B4)');
  const secondBuy = maxHeap.extractMax();
  assert(secondBuy.orderId === 'B2', 'MaxHeap extracted second highest price (B2)');
  const thirdBuy = maxHeap.extractMax();
  assert(thirdBuy.orderId === 'B3', 'MaxHeap extracted 1245 price (B3)');
  const fourthBuy = maxHeap.extractMax();
  assert(fourthBuy.orderId === 'B1', 'MaxHeap extracted 1240 price (B1)');
  assert(maxHeap.isEmpty(), 'MaxHeap is now empty');

  // ----------------------------------------------------
  // SECTION 2: MinHeap Tests
  // ----------------------------------------------------
  console.log('\n--- SECTION 2: MinHeap (SELL Orders) ---');
  const minHeap = new MinHeap();
  minHeap.insert({ orderId: 'S1', price: 1250, timestamp: t0 });
  minHeap.insert({ orderId: 'S2', price: 1240, timestamp: t1 });
  minHeap.insert({ orderId: 'S3', price: 1245, timestamp: t2 });
  minHeap.insert({ orderId: 'S4', price: 1240, timestamp: t0 }); // Same price as S2, but earlier timestamp

  assert(minHeap.size() === 4, 'MinHeap size is 4');
  // S4 (1240 @ t0) should have higher priority than S2 (1240 @ t1)
  const firstSell = minHeap.extractMin();
  assert(firstSell.orderId === 'S4', 'MinHeap extracted lowest price + earliest time (S4)');
  const secondSell = minHeap.extractMin();
  assert(secondSell.orderId === 'S2', 'MinHeap extracted second lowest price (S2)');
  const thirdSell = minHeap.extractMin();
  assert(thirdSell.orderId === 'S3', 'MinHeap extracted 1245 price (S3)');
  const fourthSell = minHeap.extractMin();
  assert(fourthSell.orderId === 'S1', 'MinHeap extracted 1250 price (S1)');
  assert(minHeap.isEmpty(), 'MinHeap is now empty');

  // ----------------------------------------------------
  // SECTION 3: OrderBook Tests
  // ----------------------------------------------------
  console.log('\n--- SECTION 3: OrderBook & Map Lookup ---');
  const book = new OrderBook('ABC');
  book.addOrder({ orderId: 'B_TEST', type: 'BUY', price: 1200, quantity: 50 });
  book.addOrder({ orderId: 'S_TEST', type: 'SELL', price: 1210, quantity: 50 });

  assert(book.getOrder('B_TEST') !== null, 'OrderBook Map retrieves order B_TEST in O(1)');
  assert(book.getSpread() === 10, 'Spread is 10 (1210 - 1200)');
  book.cancelOrder('B_TEST');
  assert(book.getOrder('B_TEST').status === 'CANCELLED', 'B_TEST status is CANCELLED');
  assert(book.buyOrders.isEmpty(), 'Cancelled buy order removed from active heap');

  // ----------------------------------------------------
  // SECTION 4: MatchingEngine Verification
  // ----------------------------------------------------
  console.log('\n--- SECTION 4: MatchingEngine Scenarios ---');
  const engine = new MatchingEngine();

  // Test 1: Basic BUY/SELL matching
  console.log('\n-> Test 1: Basic BUY/SELL Full Fill');
  engine.reset();
  // Resting SELL order: 10 shares @ 100
  engine.processOrder({ orderId: 'S101', stockSymbol: 'ABC', type: 'SELL', price: 100, quantity: 10, userId: 'Seller1' });
  // Incoming BUY order: 10 shares @ 100
  const result1 = engine.processOrder({ orderId: 'B101', stockSymbol: 'ABC', type: 'BUY', price: 100, quantity: 10, userId: 'Buyer1' });
  assert(result1.trades.length === 1, '1 Trade executed');
  assert(result1.trades[0].quantity === 10, 'Traded 10 shares');
  assert(result1.trades[0].price === 100, 'Traded at price 100');
  assert(result1.order.status === 'FILLED', 'Buyer order status is FILLED');
  assert(result1.updatedOrders[0].status === 'FILLED', 'Seller order status is FILLED');

  // Test 2: Partial fill
  console.log('\n-> Test 2: Partial Fill');
  engine.reset();
  // Resting SELL order: 50 shares @ 1245
  engine.processOrder({ orderId: 'S201', stockSymbol: 'ABC', type: 'SELL', price: 1245, quantity: 50, userId: 'SellerA' });
  // Incoming BUY order: 100 shares @ 1250
  const result2 = engine.processOrder({ orderId: 'B201', stockSymbol: 'ABC', type: 'BUY', price: 1250, quantity: 100, userId: 'BuyerA' });
  assert(result2.trades.length === 1, '1 Trade executed for partial fill');
  assert(result2.trades[0].quantity === 50, 'Matched 50 shares');
  assert(result2.trades[0].price === 1245, 'Matched at resting ask price 1245');
  assert(result2.order.status === 'PARTIALLY_FILLED', 'Incoming order is PARTIALLY_FILLED');
  assert(result2.order.remainingQuantity === 50, 'Incoming order has 50 remaining shares');
  assert(result2.updatedOrders[0].status === 'FILLED', 'Resting seller order is FILLED');
  assert(engine.getOrderBook('ABC').getBestBid().remainingQuantity === 50, 'Remaining 50 shares rest in BUY heap');

  // Test 3: Multiple orders fill across levels
  console.log('\n-> Test 3: Multiple Orders Fill Across Levels');
  engine.reset();
  engine.processOrder({ orderId: 'S301', stockSymbol: 'ABC', type: 'SELL', price: 100, quantity: 20, userId: 'S1' });
  engine.processOrder({ orderId: 'S302', stockSymbol: 'ABC', type: 'SELL', price: 105, quantity: 30, userId: 'S2' });
  // Large BUY order for 60 shares @ 110 (crosses both 100 and 105)
  const result3 = engine.processOrder({ orderId: 'B301', stockSymbol: 'ABC', type: 'BUY', price: 110, quantity: 60, userId: 'BigBuyer' });
  assert(result3.trades.length === 2, 'Executed 2 trades across 2 price levels');
  assert(result3.trades[0].quantity === 20 && result3.trades[0].price === 100, 'Trade 1: 20 @ 100');
  assert(result3.trades[1].quantity === 30 && result3.trades[1].price === 105, 'Trade 2: 30 @ 105');
  assert(result3.order.remainingQuantity === 10, '10 shares remain on BUY side');
  assert(result3.order.status === 'PARTIALLY_FILLED', 'Status is PARTIALLY_FILLED');

  // Test 4: Price priority
  console.log('\n-> Test 4: Price Priority');
  engine.reset();
  engine.processOrder({ orderId: 'S401', stockSymbol: 'ABC', type: 'SELL', price: 150, quantity: 10, userId: 'HighSeller' });
  engine.processOrder({ orderId: 'S402', stockSymbol: 'ABC', type: 'SELL', price: 140, quantity: 10, userId: 'LowSeller' });
  // Buyer offers 160 for 10 shares -> should match with lower price seller first (140)
  const result4 = engine.processOrder({ orderId: 'B401', stockSymbol: 'ABC', type: 'BUY', price: 160, quantity: 10, userId: 'BuyerP' });
  assert(result4.trades[0].seller === 'LowSeller', 'Matched with LowSeller (price 140) first');
  assert(result4.trades[0].price === 140, 'Executed at best price 140');

  // Test 5: Time priority
  console.log('\n-> Test 5: Time Priority (FIFO Tie-Breaker)');
  engine.reset();
  const timeEarlier = new Date('2026-10-01T09:00:00Z');
  const timeLater = new Date('2026-10-01T09:05:00Z');
  engine.processOrder({ orderId: 'S501', stockSymbol: 'ABC', type: 'SELL', price: 200, quantity: 10, userId: 'FirstSeller', timestamp: timeEarlier });
  engine.processOrder({ orderId: 'S502', stockSymbol: 'ABC', type: 'SELL', price: 200, quantity: 10, userId: 'SecondSeller', timestamp: timeLater });
  // Buyer matches 10 shares @ 200
  const result5 = engine.processOrder({ orderId: 'B501', stockSymbol: 'ABC', type: 'BUY', price: 200, quantity: 10, userId: 'BuyerT' });
  assert(result5.trades[0].seller === 'FirstSeller', 'Matched with FirstSeller due to earlier timestamp');

  // Test 6: Order cancellation
  console.log('\n-> Test 6: Order Cancellation');
  engine.reset();
  engine.processOrder({ orderId: 'S601', stockSymbol: 'ABC', type: 'SELL', price: 300, quantity: 50, userId: 'SellerC' });
  const cancelled = engine.cancelOrder('S601', 'ABC');
  assert(cancelled !== null && cancelled.status === 'CANCELLED', 'Order S601 successfully cancelled');
  // Incoming BUY at 300 should not match since S601 was cancelled
  const result6 = engine.processOrder({ orderId: 'B601', stockSymbol: 'ABC', type: 'BUY', price: 300, quantity: 50, userId: 'BuyerC' });
  assert(result6.trades.length === 0, 'No trade executed against cancelled order');
  assert(result6.order.status === 'OPEN', 'Incoming order rests as OPEN');

  // Test 7: No-match scenario (Spread maintained)
  console.log('\n-> Test 7: No-Match Scenario');
  engine.reset();
  engine.processOrder({ orderId: 'B701', stockSymbol: 'ABC', type: 'BUY', price: 90, quantity: 100, userId: 'BuyerNM' });
  engine.processOrder({ orderId: 'S701', stockSymbol: 'ABC', type: 'SELL', price: 110, quantity: 100, userId: 'SellerNM' });
  const depth = engine.getOrderBook('ABC').getDepth();
  assert(depth.spread === 20, 'Spread between 110 Ask and 90 Bid is 20');
  assert(depth.bids.length === 1 && depth.asks.length === 1, 'Both orders rest in book with 0 trades');

  console.log('\n========================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED PERFECTLY!`);
  console.log('========================================\n');
}

runAllTests();
