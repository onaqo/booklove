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
      this.updateSidebarCart();
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
    
    updateSidebarCart() {
      const items = this.get();
      const $sidebarContainer = $('#cart_container_id');
      
      if (!$sidebarContainer.length) return;
      
      if (items.length === 0) {
        $sidebarContainer.html('<p style="padding: 20px; text-align: center;">Your cart is empty</p>');
        return;
      }
      
      let html = '<div class="cart-items">';
      let total = 0;
      
      items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        html += `
          <div class="cart-item" style="display: flex; padding: 15px; border-bottom: 1px solid #eee; align-items: center;">
            <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 80px; object-fit: cover; margin-right: 15px;">
            <div style="flex: 1;">
              <h6 style="margin: 0 0 5px 0; font-size: 14px;">${item.title}</h6>
              <p style="margin: 0; font-size: 12px; color: #666;">Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
              <p style="margin: 5px 0 0 0; font-weight: bold;">$${itemTotal.toFixed(2)}</p>
            </div>
          </div>
        `;
      });
      
      const cartUrl = '/cart.html';
      
      html += `
        </div>
        <div class="cart-total" style="padding: 20px; border-top: 2px solid #333;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <strong>Total:</strong>
            <strong>$${total.toFixed(2)}</strong>
          </div>
          <a href="${cartUrl}" class="btn btn-solid view-cart-checkout" style="display: block; text-align: center; padding: 12px; background: #333; color: white; text-decoration: none; border-radius: 4px;">
            View Cart & Checkout
          </a>
        </div>
      `;
      
      $sidebarContainer.html(html);
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
  // Use a slight delay to ensure other scripts initialize first
  $(document).ready(function() {
    setTimeout(function() {
      console.log('BookLoopCart initialized');
      BookLoopCart.updateCount();
      BookLoopCart.updateSidebarCart(); // Update sidebar cart on page load
    }, 100);
    
    // Ensure "View Cart & Checkout" always redirects without triggering other handlers
    $(document).on('click', '.view-cart-checkout', function(e) {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = '/cart.html';
    });
    
    // Handle "Add to Cart" button clicks (no delay needed for event handlers)
    $(document).on('click', '.add-to-cart, .add_to_cart, .ajax_addtocart, .add_to_cart_detail, .fly_addtocart, .add_to_cart_btn_cls, button[name="add"]', function(e) {
      const $button = $(this);
      
      // Remove aria-hidden from parent slick slide if present (fixes carousel blocking clicks)
      const $slickSlide = $button.closest('.slick-slide[aria-hidden="true"]');
      if ($slickSlide.length) {
        console.log('Removing aria-hidden from slick slide to allow cart interaction');
        $slickSlide.removeAttr('aria-hidden');
      }
      
      // Don't prevent default for .fly_addtocart (homepage) - let theme handle it
      if (!$button.hasClass('fly_addtocart') && !$button.hasClass('ajax_addtocart')) {
        e.preventDefault();
      }
      // Never stop propagation - let other handlers run
      // e.stopPropagation(); // REMOVED
      
      console.log('Add to cart clicked!');
      
      const $form = $button.closest('form');
      
      // First, try to find the product-box (homepage products use this)
      let $container = $button.closest('.product-box, .gym-product');
      
      // If not found, try other containers (product detail pages)
      if (!$container.length) {
        $container = $button.closest('.product-item, .product-detail, .product-information, .product-right-column, .item');
      }
      
      // Still not found? Try going up from form
      if (!$container.length) {
        $container = $form.closest('.product-box, .gym-product, .product-item, .product-detail, .item');
      }
      
      // Last resort: search around the button
      if (!$container.length) {
        $container = $form.parent().closest('.product-box, .gym-product, .product-item');
      }
      
      console.log('Container found:', $container.length ? 'Yes' : 'No', $container.attr('class'));
      
      // Extract product data with multiple fallback methods
      let product = {
        // ID from various sources
        id: $container.attr('data-pro-id') ||
            $container.data('pro-id') || 
            $container.data('product-id') || 
            $form.find('[name="id"]').val() ||
            $container.find('[data-id]').attr('data-id') ||
            Date.now().toString(),
        
        // Title - homepage uses h6, product pages use h2/h1
        title: $container.find('h6[itemprop="name"]').first().text().trim() || // Homepage
               $container.find('h2[itemprop="name"]').first().text().trim() || // Product page
               $container.find('h1[itemprop="name"]').first().text().trim() ||
               $container.find('.product-title, .product-name, h6, h4, h3').first().text().trim() ||
               $container.data('product-title') ||
               $('h2[itemprop="name"], h1[itemprop="name"], h1, h2').first().text().trim() ||
               'Unknown Product',
        
        // Price - homepage has it in h4 with data-price, product pages in h3#product_price
        price: parseFloat(
          $container.find('h4[data-price]').attr('data-price') || // Homepage format (in cents)
          ($container.find('#product_price, h3#product_price').first().text() || // Product page
          $container.find('h4[data-price], .product-price, .price, .money, .price-product-detail').first().text() ||
          $container.data('product-price') ||
          '0').replace(/[^\d.]/g, '')
        ) / (
          $container.find('h4[data-price]').attr('data-price') ? 100 : 1 // Convert cents to dollars if needed
        ),
        
        // Image - look for data-bgset or regular img src
        image: $container.find('.front img').attr('src') ||
               $container.find('[data-bgset]').attr('data-bgset')?.split(',')[0]?.trim().split(' ')[0] ||
               $container.find('.product-single__photos img, .product-image img').first().attr('src') ||
               $container.find('img').first().attr('src') ||
               $container.data('product-image') ||
               $('meta[property="og:image"]').attr('content') ||
               '/cdn/shop/files/placeholder.jpg',
        
        // Quantity from form
        quantity: parseInt($form.find('[name="quantity"], .quantity-selector, #quantity-detail').val()) || 1
      };
      
      console.log('Product data extracted:', product);
      
      // Validate product data
      if (!product.title || product.title === 'Unknown Product' || product.price === 0) {
        console.warn('Invalid product data, trying alternative method:', product);
        
        // Try alternative extraction methods
        if (!product.title || product.title === 'Unknown Product') {
          // Homepage: h6 inside link
          product.title = $container.find('a[href*="/products/"] h6, h6').first().text().trim();
          
          // Product page: h2 or h1 with itemprop
          if (!product.title) {
            product.title = $('h2[itemprop="name"], h1[itemprop="name"]').first().text().trim();
          }
          
          // Fallback to any h1/h2
          if (!product.title) {
            product.title = $('h1, h2').first().text().trim();
          }
        }
        
        if (product.price === 0) {
          // Try h3#product_price (product pages)
          const productPagePrice = $('#product_price, h3#product_price').first().text().trim();
          if (productPagePrice) {
            product.price = parseFloat(productPagePrice.replace(/[^\d.]/g, ''));
          }
          
          // Try h4 (homepage)
          if (product.price === 0) {
            const priceText = $container.find('h4').first().text().trim();
            product.price = parseFloat(priceText.replace(/[^\d.]/g, ''));
          }
        }
        
        if (product.image === '/cdn/shop/files/placeholder.jpg') {
          // Try data-bgset (homepage)
          const bgset = $container.find('[data-bgset]').attr('data-bgset');
          if (bgset) {
            product.image = bgset.split(',')[0].trim().split(' ')[0];
          }
          
          // Try og:image meta tag (product pages)
          if (product.image === '/cdn/shop/files/placeholder.jpg') {
            const ogImage = $('meta[property="og:image"]').attr('content');
            if (ogImage) {
              product.image = ogImage;
            }
          }
          
          // Try any visible img
          if (product.image === '/cdn/shop/files/placeholder.jpg') {
            const anyImg = $('.product-single__photos img, .product-image img, img:visible').first().attr('src');
            if (anyImg) {
              product.image = anyImg;
            }
          }
        }
        
        console.log('Updated product data after alternatives:', product);
      }
      
      if (!product.title || product.title === 'Unknown Product' || product.price === 0) {
        alert('Unable to find product details. Please try again.');
        console.error('Failed to extract product data. Container:', $container[0]);
        return;
      }
      
      // Add to cart
      BookLoopCart.add(product);
      console.log('Product added to cart successfully');
      
      // Update sidebar cart if it exists
      BookLoopCart.updateSidebarCart();
      
      // Let the theme's own cart system handle the sidebar display
      // Don't auto-open to avoid conflicts with theme
      
      // Optional: Redirect to cart page after delay
      // setTimeout(() => window.location.href = '/cart.html', 1500);
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
    
    // Handle sidebar cart close button
    $(document).on('click', '.close-cart a, #cart_side .overlay', function(e) {
      e.preventDefault();
      $('#cart_side').removeClass('open-side');
    });
    
    // Handle cart icon click to open sidebar
    $(document).on('click', '.icon-cart, a[onclick*="openCart"]', function(e) {
      if ($('#cart_side').length) {
        e.preventDefault();
        BookLoopCart.updateSidebarCart();
        $('#cart_side').addClass('open-side');
      }
    });
  });

})();

