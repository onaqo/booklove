/**
 * Book Loop Book - Cart Integration
 * Add this script to enable cart functionality across the site
 */

(function() {
  'use strict';

  // Cart management object
  window.BookLoopCart = {
    get() {
      const cart = localStorage.getItem('bookloop_cart');
      return cart ? JSON.parse(cart) : [];
    },
    
    save(items) {
      localStorage.setItem('bookloop_cart', JSON.stringify(items));
      this.updateCount();
      this.updateCartUI();
    },
    
    add(product) {
      const items = this.get();
      const existing = items.find(item => item.id === product.id);
      
      if (existing) {
        existing.quantity += product.quantity || 1;
      } else {
        items.push({
          id: product.id || Date.now().toString(),
          title: product.title,
          price: parseFloat(product.price),
          image: product.image,
          quantity: product.quantity || 1
        });
      }
      
      this.save(items);
      this.showNotification('Added to cart!');
    },
    
    updateQuantity(id, quantity) {
      const items = this.get();
      const item = items.find(i => i.id === id);
      if (item) {
        item.quantity = Math.max(1, quantity);
        this.save(items);
      }
    },
    
    remove(id) {
      const items = this.get().filter(item => item.id !== id);
      this.save(items);
    },
    
    clear() {
      localStorage.removeItem('bookloop_cart');
      this.updateCount();
    },
    
    getTotal() {
      return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    getCount() {
      return this.get().reduce((sum, item) => sum + item.quantity, 0);
    },
    
    updateCount() {
      const count = this.getCount();
      $('.cart-count, .cart_count, #cart-count').text(count);
      
      // Update cart badge if exists
      if (count > 0) {
        $('.cart-badge').text(count).show();
      } else {
        $('.cart-badge').hide();
      }
    },
    
    updateCartUI() {
      // Trigger custom event for cart updates
      $(document).trigger('cart:updated', [this.get()]);
    },
    
    showNotification(message) {
      // Create notification element
      const notification = $('<div>')
        .addClass('cart-notification')
        .html(`
          <i class="fa fa-check-circle"></i>
          <span>${message}</span>
        `)
        .css({
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#28a745',
          color: 'white',
          padding: '15px 25px',
          borderRadius: '5px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: '9999',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          animation: 'slideInRight 0.3s ease'
        });
      
      $('body').append(notification);
      
      setTimeout(() => {
        notification.fadeOut(300, function() {
          $(this).remove();
        });
      }, 3000);
    }
  };

  // Initialize cart count on page load
  $(document).ready(function() {
    BookLoopCart.updateCount();
    
    // Handle "Add to Cart" button clicks
    $(document).on('click', '.add-to-cart, .add_to_cart, .ajax_addtocart, button[name="add"]', function(e) {
      e.preventDefault();
      
      const $button = $(this);
      const $form = $button.closest('form');
      const $productBox = $button.closest('.product-box, .product-item, .product-detail');
      
      // Extract product data
      let product = {
        id: $productBox.data('product-id') || 
            $productBox.data('pro-id') || 
            $form.find('[name="id"]').val() ||
            $productBox.find('.product-id').text() ||
            Date.now().toString(),
        
        title: $productBox.find('.product-title, .product-name, h3, h4').first().text().trim() ||
               $productBox.data('product-title') ||
               'Product',
        
        price: parseFloat(
          $productBox.find('.product-price, .price, .money').first().text().replace(/[^0-9.]/g, '') ||
          $productBox.data('product-price') ||
          0
        ),
        
        image: $productBox.find('img').first().attr('src') ||
               $productBox.data('product-image') ||
               '/cdn/shop/files/placeholder.jpg',
        
        quantity: parseInt($form.find('[name="quantity"], .quantity-selector').val()) || 1
      };
      
      // Validate product data
      if (!product.title || product.price === 0) {
        console.warn('Invalid product data:', product);
        alert('Unable to add product to cart. Please try again.');
        return;
      }
      
      // Add to cart
      BookLoopCart.add(product);
      
      // Optional: Redirect to cart page
      // setTimeout(() => window.location.href = '/cart.html', 1000);
    });
    
    // Handle quick view add to cart
    $(document).on('click', '.quick-view-add-to-cart', function(e) {
      e.preventDefault();
      
      const $modal = $(this).closest('.modal, .quickview');
      const product = {
        id: $modal.find('[name="id"]').val() || Date.now().toString(),
        title: $modal.find('.product-title, h3').text().trim(),
        price: parseFloat($modal.find('.price').text().replace(/[^0-9.]/g, '')),
        image: $modal.find('img').first().attr('src'),
        quantity: parseInt($modal.find('[name="quantity"]').val()) || 1
      };
      
      BookLoopCart.add(product);
    });
    
    // Update cart icon with current count
    const cartCount = BookLoopCart.getCount();
    if (cartCount > 0) {
      // Add badge to cart icon if it doesn't exist
      if ($('.cart-icon, .cart-link').length && !$('.cart-badge').length) {
        $('.cart-icon, .cart-link').append(
          `<span class="cart-badge" style="
            position: absolute;
            top: -8px;
            right: -8px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
          ">${cartCount}</span>`
        );
      }
    }
    
    // Add CSS for animations
    if (!$('#cart-notification-styles').length) {
      $('head').append(`
        <style id="cart-notification-styles">
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          .cart-notification i {
            font-size: 20px;
          }
          
          @media (max-width: 768px) {
            .cart-notification {
              right: 10px !important;
              left: 10px !important;
              top: 10px !important;
            }
          }
        </style>
      `);
    }
  });

  // Listen for cart updates
  $(document).on('cart:updated', function(e, cart) {
    console.log('Cart updated:', cart);
  });

  // Add "View Cart" link to header if not exists
  $(document).ready(function() {
    const $cartLink = $('.cart-link, .icon-cart').parent();
    if ($cartLink.length) {
      $cartLink.attr('href', '/cart.html');
    }
  });

})();

