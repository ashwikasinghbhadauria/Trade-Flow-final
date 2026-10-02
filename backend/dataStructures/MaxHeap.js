/**
 * MaxHeap.js — Data Structures Implementation for BUY Orders
 * 
 * Engineering Data Structures Specification:
 * - A Binary Max-Heap represented as a zero-indexed contiguous array.
 * - For node at index i:
 *     Parent:      Math.floor((i - 1) / 2)
 *     Left Child:  2 * i + 1
 *     Right Child: 2 * i + 2
 * 
 * Priority Rules (Price-Time Priority):
 * 1. Primary: Highest BUY Price has highest priority (Max-Heap property).
 * 2. Secondary (Tie-Breaker): If prices are identical, the earlier order
 *    (smaller timestamp) has higher priority (FIFO queue property).
 * 
 * Time Complexities:
 * - Insert:     O(log n)
 * - ExtractMax: O(log n)
 * - Peek:       O(1)
 * - Remove:     O(n) search + O(log n) reheapify
 * - Size:       O(1)
 * - Space:      O(n)
 */

export class MaxHeap {
  constructor() {
    this.heap = [];
  }

  /**
   * Helper to get parent index
   * @param {number} i 
   * @returns {number}
   */
  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  /**
   * Helper to get left child index
   * @param {number} i 
   * @returns {number}
   */
  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  /**
   * Helper to get right child index
   * @param {number} i 
   * @returns {number}
   */
  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  /**
   * Swaps two elements in the heap array
   * @param {number} i 
   * @param {number} j 
   */
  swap(i, j) {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * Comparator for BUY orders:
   * Returns true if orderA has STRICTLY HIGHER priority than orderB.
   * Price-Time Priority:
   * 1. Higher price > Lower price
   * 2. If prices equal, Earlier timestamp > Later timestamp
   * 
   * @param {Object} orderA 
   * @param {Object} orderB 
   * @returns {boolean}
   */
  hasHigherPriority(orderA, orderB) {
    if (!orderB) return true;
    if (!orderA) return false;

    // 1. Compare Price (Higher price wins for BUY orders)
    if (orderA.price > orderB.price) {
      return true;
    }
    if (orderA.price < orderB.price) {
      return false;
    }

    // 2. Tie-breaker: Timestamp (Earlier timestamp wins)
    const timeA = new Date(orderA.timestamp).getTime();
    const timeB = new Date(orderB.timestamp).getTime();
    return timeA < timeB;
  }

  /**
   * Inserts a new BUY order into the Max-Heap and bubbles it up.
   * Time Complexity: O(log n)
   * 
   * @param {Object} order 
   */
  insert(order) {
    if (!order) return;
    // Add to the end of the heap array
    this.heap.push(order);
    // Bubble up to restore max-heap property
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Moves the element at index up the heap until heap invariant is satisfied.
   * @param {number} index 
   */
  bubbleUp(index) {
    let currentIndex = index;
    while (currentIndex > 0) {
      const parentIndex = this.getParentIndex(currentIndex);
      if (this.hasHigherPriority(this.heap[currentIndex], this.heap[parentIndex])) {
        this.swap(currentIndex, parentIndex);
        currentIndex = parentIndex;
      } else {
        break;
      }
    }
  }

  /**
   * Returns the highest priority BUY order without removing it.
   * Time Complexity: O(1)
   * 
   * @returns {Object|null}
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Removes and returns the highest priority BUY order from the heap.
   * Time Complexity: O(log n)
   * 
   * @returns {Object|null}
   */
  extractMax() {
    if (this.heap.length === 0) {
      return null;
    }
    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const maxOrder = this.heap[0];
    // Move last element to root and bubble down
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return maxOrder;
  }

  /**
   * Moves the element at index down the heap until heap invariant is satisfied.
   * @param {number} index 
   */
  bubbleDown(index) {
    let currentIndex = index;
    const length = this.heap.length;

    while (true) {
      let highestPriorityIndex = currentIndex;
      const leftChildIndex = this.getLeftChildIndex(currentIndex);
      const rightChildIndex = this.getRightChildIndex(currentIndex);

      // Check left child
      if (
        leftChildIndex < length &&
        this.hasHigherPriority(this.heap[leftChildIndex], this.heap[highestPriorityIndex])
      ) {
        highestPriorityIndex = leftChildIndex;
      }

      // Check right child
      if (
        rightChildIndex < length &&
        this.hasHigherPriority(this.heap[rightChildIndex], this.heap[highestPriorityIndex])
      ) {
        highestPriorityIndex = rightChildIndex;
      }

      // If root is still highest priority, heap is valid
      if (highestPriorityIndex === currentIndex) {
        break;
      }

      // Otherwise swap and continue bubbling down
      this.swap(currentIndex, highestPriorityIndex);
      currentIndex = highestPriorityIndex;
    }
  }

  /**
   * Removes a specific order by orderId from the heap.
   * Time Complexity: O(n) to find + O(log n) to restore heap
   * 
   * @param {string} orderId 
   * @returns {Object|null} The removed order, or null if not found
   */
  remove(orderId) {
    const index = this.heap.findIndex((o) => o.orderId === orderId || o._id?.toString() === orderId);
    if (index === -1) return null;

    const removedOrder = this.heap[index];
    const lastIndex = this.heap.length - 1;

    if (index === lastIndex) {
      this.heap.pop();
      return removedOrder;
    }

    // Replace with last element and restore heap invariant
    this.heap[index] = this.heap.pop();
    const parentIndex = this.getParentIndex(index);

    if (index > 0 && this.hasHigherPriority(this.heap[index], this.heap[parentIndex])) {
      this.bubbleUp(index);
    } else {
      this.bubbleDown(index);
    }

    return removedOrder;
  }

  /**
   * Returns current number of active buy orders in the heap
   * Time Complexity: O(1)
   * @returns {number}
   */
  size() {
    return this.heap.length;
  }

  /**
   * Checks if heap is empty
   * Time Complexity: O(1)
   * @returns {boolean}
   */
  isEmpty() {
    return this.heap.length === 0;
  }

  /**
   * Returns a copy of the raw heap array
   * @returns {Array}
   */
  toArray() {
    return [...this.heap];
  }

  /**
   * Returns all orders sorted in true priority order (non-destructive).
   * Used for Order Book UI presentation and depth calculation.
   * 
   * @returns {Array}
   */
  getSortedOrders() {
    const copy = new MaxHeap();
    copy.heap = this.heap.map((order) => ({ ...order }));
    const result = [];
    while (!copy.isEmpty()) {
      result.push(copy.extractMax());
    }
    return result;
  }

  /**
   * Clears the heap
   */
  clear() {
    this.heap = [];
  }
}

export default MaxHeap;
