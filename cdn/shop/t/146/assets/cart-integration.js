/**
 * Book Loop Book - Cart Integration
 * Complete localStorage-based cart system
 */

(function() {
  'use strict';

  // Wait for jQuery to be available
  function initCart() {
    if (typeof jQuery === 'undefined') {
      setTimeout(initCart, 50);
      return;
    }
    
    const $ = jQuery;

    // Cart management object - available globally
    window.BookLoopCart = {
      get() {
        try {
          const cart = localStorage.getItem('bookloop_cart');
          return cart ? JSON.parse(cart) : [];
        } catch (e) {
          console.error('Error reading cart from localStorage:', e);
          return [];
        }
      },
      
      save(items) {
        try {
          localStorage.setItem('bookloop_cart', JSON.stringify(items));
          this.updateCount();
          this.updateCartUI();
          this.updateSidebarCart();
          console.log('Cart saved to localStorage:', items);
        } catch (e) {
          console.error('Error saving cart to localStorage:', e);
        }
      },
      
      add(product) {
        console.log('Adding product to cart:', product);
        
        // Validate product before adding
        const price = parseFloat(product.price);
        const title = String(product.title || '').trim();
        
        // Reject invalid products
        if (!price || isNaN(price) || price <= 0) {
          console.error('Cannot add product: invalid price', product);
          return false;
        }
        
        if (!title || title === '' || title === 'Unknown Product') {
          console.error('Cannot add product: invalid title', product);
          return false;
        }
        
        // Reject menu items, category headers, etc.
        const invalidTitles = ['SHOP BY CATEGORY', 'CATEGORY', 'MENU', 'NAVIGATION'];
        if (invalidTitles.some(invalid => title.toUpperCase().includes(invalid))) {
          console.error('Cannot add product: appears to be a menu/category item', product);
          return false;
        }
        
        const items = this.get();
        const existing = items.find(item => String(item.id) === String(product.id));
        
        if (existing) {
          existing.quantity += (product.quantity || 1);
        } else {
          items.push({
            id: String(product.id || Date.now().toString()),
            title: title,
            price: price,
            image: product.image || '/cdn/shop/files/placeholder.jpg',
            quantity: parseInt(product.quantity) || 1
          });
        }
        
        this.save(items);
        this.showNotification('Added to cart!');
        console.log('Cart after add:', this.get());
        return true;
      },
      
      updateQuantity(id, quantity) {
        const items = this.get();
        const item = items.find(i => String(i.id) === String(id));
        if (item) {
          item.quantity = Math.max(1, parseInt(quantity));
          this.save(items);
        }
      },
      
      remove(id) {
        const items = this.get().filter(item => String(item.id) !== String(id));
        this.save(items);
      },
      
      clear() {
        localStorage.removeItem('bookloop_cart');
        this.updateCount();
        this.updateSidebarCart();
      },
      
      getTotal() {
        return this.get().reduce((sum, item) => {
          const price = parseFloat(item.price) || 0;
          const qty = parseInt(item.quantity) || 1;
          return sum + (price * qty);
        }, 0);
      },
      
      getCount() {
        return this.get().reduce((sum, item) => sum + parseInt(item.quantity), 0);
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
        $(document).trigger('cart:updated', [this.get()]);
      },
      
      updateSidebarCart() {
        const items = this.get();
        const $sidebarContainer = $('#cart_container_id');
        
        if (!$sidebarContainer.length) {
          console.log('Cart sidebar container not found');
          return;
        }
        
        // Filter out invalid items (null price, invalid titles, etc.)
        const validItems = items.filter(item => {
          const price = parseFloat(item.price);
          const title = String(item.title || '').trim();
          
          // Reject items with null/invalid price
          if (!price || isNaN(price) || price <= 0) {
            console.warn('Removing invalid item from cart (invalid price):', item);
            return false;
          }
          
          // Reject items with invalid titles (menu items, category headers, etc.)
          const invalidTitles = ['SHOP BY CATEGORY', 'CATEGORY', 'MENU', 'NAVIGATION', 'Unknown Product'];
          if (!title || title === '' || invalidTitles.some(invalid => title.toUpperCase().includes(invalid))) {
            console.warn('Removing invalid item from cart (invalid title):', item);
            return false;
          }
          
          return true;
        });
        
        // If we filtered out items, save the cleaned cart
        if (validItems.length !== items.length) {
          console.log('Cleaned cart: removed', items.length - validItems.length, 'invalid items');
          this.save(validItems);
          return; // Will be called again after save
        }
        
        console.log('Updating sidebar cart with', validItems.length, 'items');
        
        if (validItems.length === 0) {
          $sidebarContainer.html('<p style="padding: 20px; text-align: center;">Your cart is empty</p>');
          return;
        }
        
        let html = '<div class="cart-items">';
        let total = 0;
        
        validItems.forEach(item => {
          const itemPrice = parseFloat(item.price) || 0;
          const itemQty = parseInt(item.quantity) || 1;
          const itemTotal = itemPrice * itemQty;
          total += itemTotal;
          
          // Ensure we have valid numbers before calling toFixed
          const priceStr = (itemPrice && !isNaN(itemPrice)) ? itemPrice.toFixed(2) : '0.00';
          const totalStr = (itemTotal && !isNaN(itemTotal)) ? itemTotal.toFixed(2) : '0.00';
          
          html += `
            <div class="cart-item" style="display: flex; padding: 15px; border-bottom: 1px solid #eee; align-items: center;">
              <img src="${item.image || '/cdn/shop/files/placeholder.jpg'}" alt="${item.title}" style="width: 60px; height: 80px; object-fit: cover; margin-right: 15px;" onerror="this.src='/cdn/shop/files/placeholder.jpg'">
              <div style="flex: 1;">
                <h6 style="margin: 0 0 5px 0; font-size: 14px;">${item.title || 'Unknown Product'}</h6>
                <p style="margin: 0; font-size: 12px; color: #666;">Qty: ${itemQty} × $${priceStr}</p>
                <p style="margin: 5px 0 0 0; font-weight: bold;">$${totalStr}</p>
              </div>
            </div>
          `;
        });
        
        html += `
          </div>
          <div class="cart-total" style="padding: 20px; border-top: 2px solid #333;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
              <strong>Total:</strong>
              <strong>$${total.toFixed(2)}</strong>
            </div>
            <a href="/cart.html" class="btn btn-solid view-cart-checkout" style="display: block; text-align: center; padding: 12px; background: #333; color: white; text-decoration: none; border-radius: 4px;">
              View Cart & Checkout
            </a>
          </div>
        `;
        
        $sidebarContainer.html(html);
      },
      
      showNotification(message) {
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

    // Override theme handlers
    function overrideThemeHandlers() {
      $(document).off('click', '.add_to_cart_btn_cls');
      $(document).off('click', '.fly_addtocart');
      $(document).off('click', '.add_to_cart');
      $(document).off('click', '.ajax_addtocart');
      $(document).off('submit', 'form[action*="/cart/add"]');
      $('form[action*="/cart/add"]').off('submit');
      $('.add_to_cart_btn_cls, .fly_addtocart').off('click');
      console.log('BookLoopCart: Overrode theme handlers');
    }

    // Function to extract product data
    function extractProductData($button, $form) {
      // Find container
      let $container = $button.closest('.product-box, .gym-product');
      if (!$container.length) {
        $container = $button.closest('.product-item, .product-detail, .product-information, .product-right-column, .item');
      }
      if (!$container.length) {
        $container = $form.closest('.product-box, .gym-product, .product-item, .product-detail, .item, .product-single, .product-main');
      }
      if (!$container.length) {
        $container = $form.parent().closest('.product-box, .gym-product, .product-item, .product-single, .product-main');
      }

      // Get variant ID
      const $idSelect = $form.find('select[name="id"]');
      const variantId = ($idSelect.length ? ($idSelect.find('option:selected').val() || $idSelect.val()) : '') ||
                        $form.find('input[name="id"]').val() ||
                        $form.find('[name="id"]').val() ||
                        $container.attr('data-pro-id') ||
                        $container.data('pro-id') ||
                        Date.now().toString();

      // Get title
      let title = ($container.length ? $container.find('h6[itemprop="name"]').first().text().trim() : '') ||
                  ($container.length ? $container.find('h2[itemprop="name"]').first().text().trim() : '') ||
                  ($container.length ? $container.find('h1[itemprop="name"]').first().text().trim() : '') ||
                  $('h2[itemprop="name"]').first().text().trim() ||
                  $('h1[itemprop="name"]').first().text().trim() ||
                  $('h2').first().text().trim() ||
                  $('h1').first().text().trim() ||
                  'Unknown Product';

      // Get price
      let price = 0;
      const homepagePrice = $container.length ? $container.find('h4[data-price]').attr('data-price') : '';
      if (homepagePrice) {
        price = parseFloat(homepagePrice) / 100;
      } else {
        const productPrice = ($container.length ? $container.find('#product_price, h3#product_price').first().text() : '') ||
                            $('#product_price').first().text() ||
                            $('h3#product_price').first().text();
        if (productPrice) {
          price = parseFloat(productPrice.replace(/[^\d.]/g, ''));
        }
      }
      if (price === 0 || isNaN(price)) {
        const otherPrice = ($container.length ? $container.find('h4[data-price], .product-price, .price, .money').first().text() : '') ||
                          $container.data('product-price') ||
                          '0';
        price = parseFloat(otherPrice.replace(/[^\d.]/g, '')) || 0;
      }

      // Get image
      let image = ($container.length ? $container.find('.front img').attr('src') : '') ||
                  ($container.length ? ($container.find('[data-bgset]').attr('data-bgset')?.split(',')[0]?.trim().split(' ')[0] || '') : '') ||
                  ($container.length ? $container.find('.product-single__photos img, .product-image img').first().attr('src') : '') ||
                  $('meta[property="og:image"]').attr('content') ||
                  $('meta[itemprop="image"]').attr('content') ||
                  $('.product-single__photos img, .product-image img').first().attr('src') ||
                  '/cdn/shop/files/placeholder.jpg';

      // Get quantity
      const quantity = parseInt($form.find('[name="quantity"], .quantity-selector, #quantity-detail, #quantity').val()) || 1;

      return {
        id: String(variantId),
        title: title,
        price: price,
        image: image,
        quantity: quantity
      };
    }

    // Handle add to cart
    function handleAddToCart($button, $form) {
      console.log('handleAddToCart called', $button.length, $form.length);
      
      // Early validation - check if we're in a valid product context
      if (!$form.length) {
        $form = $button.closest('form[action*="/cart/add"]');
      }
      
      // If no form and not in a product container, silently return (don't show alert)
      if (!$form.length) {
        const isInProductContainer = $button.closest('.product-box, .gym-product, .product-item, .product-detail, .product-single, .product-main, .product-information').length > 0;
        if (!isInProductContainer) {
          console.log('Not in product context, ignoring click');
          return; // Silently return, don't show alert
        }
      }
      
      // Additional check: if form exists but doesn't have product data, silently return
      if ($form.length && !$form.find('select[name="id"], input[name="id"]').length && 
          !$form.closest('.product-box, .gym-product, .product-item, .product-detail').length) {
        console.log('Form found but no product context, ignoring');
        return; // Silently return
      }
      
      const product = extractProductData($button, $form);
      console.log('Extracted product:', product);
      
      // Only show alerts if we're definitely in a product context
      const isDefinitelyProductContext = $form.length > 0 || 
                                         $button.closest('.product-box, .gym-product, .product-item, .product-detail, .product-single').length > 0;
      
      if (!product.title || product.title === 'Unknown Product') {
        console.error('Invalid product title:', product);
        // Only show alert if we're in a product context
        if (isDefinitelyProductContext) {
          alert('Unable to find product title. Please try again.');
        }
        return;
      }
      
      if (!product.price || product.price === 0 || isNaN(product.price)) {
        console.error('Invalid product price:', product);
        // Only show alert if we're in a product context
        if (isDefinitelyProductContext) {
          alert('Unable to find product price. Please try again.');
        }
        return;
      }
      
      // Additional validation: reject menu items and category headers
      const invalidTitles = ['SHOP BY CATEGORY', 'CATEGORY', 'MENU', 'NAVIGATION'];
      if (invalidTitles.some(invalid => product.title.toUpperCase().includes(invalid))) {
        console.error('Rejecting non-product item:', product);
        return; // Silently reject, don't show alert
      }
      
      // Add to cart
      const added = BookLoopCart.add(product);
      if (!added) {
        console.error('Failed to add product to cart');
        return;
      }
      
      // Update and open sidebar - ALWAYS open after adding item, NEVER auto-close
      const $cartSide = $('#cart_side');
      if ($cartSide.length) {
        // Set flag to prevent closing during add-to-cart operation
        window._cartAddingItem = true;
        
        // Update cart data first
        BookLoopCart.updateSidebarCart();
        
        // Set up a watcher to immediately re-open if something closes it
        const cartElement = $cartSide[0];
        let closeWatcher = null;
        if (cartElement) {
          closeWatcher = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (window._cartAddingItem && !cartElement.classList.contains('open-side')) {
                  console.log('Detected cart close attempt, forcing it back open');
                  $cartSide.addClass('open-side');
                }
              }
            });
          });
          closeWatcher.observe(cartElement, {
            attributes: true,
            attributeFilter: ['class']
          });
        }
        
        // Always ensure sidebar is open after adding item (never toggle, always open)
        // Cart will stay open until user manually closes it via close button
        setTimeout(function() {
          // Force open - add class multiple times to ensure it sticks
          $cartSide.addClass('open-side');
          
          // Refresh content to show new item
          BookLoopCart.updateSidebarCart();
          
          // Continuously check and re-open if something closes it (for 2 seconds)
          let checkCount = 0;
          const maxChecks = 20; // Check 20 times over 2 seconds
          const checkInterval = setInterval(function() {
            checkCount++;
            if (!$cartSide.hasClass('open-side')) {
              console.log('Cart was closed, forcing it back open');
              $cartSide.addClass('open-side');
            }
            if (checkCount >= maxChecks) {
              clearInterval(checkInterval);
              window._cartAddingItem = false;
              // Disconnect watcher after we're done
              if (closeWatcher) {
                closeWatcher.disconnect();
              }
            }
          }, 100);
          
          console.log('Cart sidebar opened/refreshed after adding item - will stay open until user closes');
        }, 100);
      }
    }

    // Intercept any attempts to close cart during add-to-cart operations
    // This prevents other scripts from closing the cart
    function preventCartCloseDuringAdd() {
      const $cartSide = $('#cart_side');
      if ($cartSide.length) {
        // Monitor for class changes that remove open-side
        const cartElement = $cartSide[0];
        if (cartElement) {
          const originalRemoveAttribute = cartElement.removeAttribute;
          cartElement.removeAttribute = function(name) {
            if (name === 'class' && window._cartAddingItem) {
              console.log('Blocked removeAttribute on cart during add-to-cart');
              return; // Don't remove class during add-to-cart
            }
            return originalRemoveAttribute.apply(this, arguments);
          };
        }
      }
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
      overrideThemeHandlers();
      preventCartCloseDuringAdd();
      
      // Initialize cart and clean up any invalid items
      setTimeout(function() {
        console.log('BookLoopCart initialized');
        
        // Clean up invalid items from cart
        const items = BookLoopCart.get();
        const validItems = items.filter(item => {
          const price = parseFloat(item.price);
          const title = String(item.title || '').trim();
          
          // Reject items with null/invalid price
          if (!price || isNaN(price) || price <= 0) {
            return false;
          }
          
          // Reject items with invalid titles
          const invalidTitles = ['SHOP BY CATEGORY', 'CATEGORY', 'MENU', 'NAVIGATION', 'Unknown Product'];
          if (!title || title === '' || invalidTitles.some(invalid => title.toUpperCase().includes(invalid))) {
            return false;
          }
          
          return true;
        });
        
        // If we found invalid items, clean them up
        if (validItems.length !== items.length) {
          console.log('Cleaning cart: removing', items.length - validItems.length, 'invalid items');
          BookLoopCart.save(validItems);
        }
        
        BookLoopCart.updateCount();
        BookLoopCart.updateSidebarCart();
      }, 100);

      // Handle form submissions - only forms that are actually add-to-cart forms
      $(document).on('submit', 'form[action*="/cart/add"]:not(.header *):not(.menu *):not(.nav *):not(.navigation *)', function(e) {
        const $form = $(this);
        
        // Only handle if form is inside a product container or has product-related classes
        const isProductForm = $form.closest('.product-box, .gym-product, .product-item, .product-detail, .product-single, .product-main, .product-information').length > 0 ||
                             $form.hasClass('variants') ||
                             $form.hasClass('form-ajaxtocart') ||
                             $form.find('select[name="id"], input[name="id"]').length > 0;
        
        if (!isProductForm) {
          return; // Let the form submit normally
        }
        
        e.preventDefault();
        e.stopImmediatePropagation();
        
        const $button = $form.find('button[type="submit"], input[type="submit"], .add_to_cart_btn_cls, .fly_addtocart, .add_to_cart, .ajax_addtocart, .add_to_cart_detail').first();
        
        console.log('Form submission intercepted for add to cart');
        handleAddToCart($button.length ? $button : $form.find('button[type="submit"], input[type="submit"]').first(), $form);
        
        return false;
      });

      // Handle button clicks - be very specific to avoid catching menu items and links
      // Only target actual buttons inside product forms, not links or menu items
      $(document).on('click', 'form[action*="/cart/add"] button[type="submit"], form[action*="/cart/add"] input[type="submit"], form[action*="/cart/add"] .add_to_cart_btn_cls, form[action*="/cart/add"] .fly_addtocart, form[action*="/cart/add"] .add_to_cart, form[action*="/cart/add"] .ajax_addtocart, form[action*="/cart/add"] .add_to_cart_detail, button[name="add"], input[name="add"]', function(e) {
        const $button = $(this);
        
        // Skip if it's a link
        if ($button.is('a')) {
          return;
        }
        
        // Skip if it's in navigation/menu/header
        if ($button.closest('.header, .menu, .nav, .navigation, .navbar, .menu-item, .nav-item, .header-menu').length > 0) {
          return;
        }
        
        // Must be inside a product container or form
        const $form = $button.closest('form[action*="/cart/add"]');
        const isInProductContainer = $button.closest('.product-box, .gym-product, .product-item, .product-detail, .product-single, .product-main, .product-information').length > 0;
        
        if (!$form.length && !isInProductContainer) {
          return; // Not in a product context, ignore silently
        }
        
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        console.log('Add to cart button clicked:', $button.attr('class'));
        handleAddToCart($button, $form.length ? $form : $button.closest('form'));
      });

      // View cart link
      $(document).on('click', '.view-cart-checkout', function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = '/cart.html';
      });

      // Cart icon click
      $(document).on('click', '.icon-cart, a[onclick*="openCart"], .cart-link, [onclick*="cart_side"]', function(e) {
        if ($('#cart_side').length) {
          e.preventDefault();
          e.stopPropagation();
          BookLoopCart.updateSidebarCart();
          $('#cart_side').addClass('open-side');
        }
      });

      // Sidebar close - ONLY via close button, NOT via overlay
      // Disabled auto-close on overlay click - user must use close button
      // Also prevent closing if we're in the middle of adding an item
      $(document).on('click', '.close-cart a, .close-cart, .close-cart button', function(e) {
        // Don't allow closing if we're adding an item
        if (window._cartAddingItem) {
          console.log('Prevented cart close during add-to-cart operation');
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        $('#cart_side').removeClass('open-side');
        console.log('Cart closed via close button');
      });
      
      // Prevent overlay from closing cart - user wants manual control only
      $(document).on('click', '#cart_side .overlay', function(e) {
        e.stopPropagation(); // Prevent any default close behavior
        // Don't close - let user use close button
      });

      // MutationObserver for sidebar - refresh content when opened (but don't interfere with our add-to-cart)
      if ($('#cart_side').length) {
        const cartSidebar = document.getElementById('cart_side');
        if (cartSidebar) {
          let lastUpdateTime = 0;
          
          const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (cartSidebar.classList.contains('open-side')) {
                  // Only update if it's been more than 200ms since last update (prevents rapid updates)
                  const now = Date.now();
                  if (now - lastUpdateTime > 200) {
                    lastUpdateTime = now;
                    setTimeout(function() {
                      BookLoopCart.updateSidebarCart();
                    }, 50);
                  }
                }
              }
            });
          });
          observer.observe(cartSidebar, {
            attributes: true,
            attributeFilter: ['class']
          });
        }
      }

      // Add CSS
      if (!$('#cart-notification-styles').length) {
        $('head').append(`
          <style id="cart-notification-styles">
            @keyframes slideInRight {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
            .cart-notification i { font-size: 20px; }
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

    // Re-override handlers after delay
    setTimeout(overrideThemeHandlers, 200);
    setTimeout(overrideThemeHandlers, 500);
  }

  // Start initialization
  initCart();

})();
