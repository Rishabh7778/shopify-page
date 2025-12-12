// CHAT IA - 100% VANILLA JAVASCRIPT - PROGRAMACIÓN FUNCIONAL
// No React dependencies - Safe for Shopify themes
(function() {
  'use strict';
  
  // ===== FUNCIONES UTILITARIAS =====
  
  function generateSessionId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  
  function getShopFromUrl() {
    const url = window.location.href;
    const shopMatch = url.match(/\/\/([^.]+)\.myshopify\.com/);
    return shopMatch ? shopMatch[1] : 'unknown-shop';
  }

  // ===== SISTEMA DE TOAST NOTIFICATIONS =====
  
  function createToastSystem() {
    let toastContainer = null;
    let toastCounter = 0;
    
    function ensureToastContainer() {
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'chat-ia__toast-container';
        toastContainer.className = 'chat-ia__toast-container';
        toastContainer.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          left: 20px;
          z-index: 10000;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        `;
        
        // Media query for mobile - center the toasts
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const updateToastPosition = (e) => {
          if (e.matches) {
            // Mobile: center the toasts
            toastContainer.style.alignItems = 'center';
            toastContainer.style.left = '12px';
            toastContainer.style.right = '12px';
            toastContainer.style.top = '16px';
          } else {
            // Desktop: align to right
            toastContainer.style.alignItems = 'flex-end';
            toastContainer.style.left = '20px';
            toastContainer.style.right = '20px';
            toastContainer.style.top = '20px';
          }
        };
        
        mediaQuery.addEventListener('change', updateToastPosition);
        updateToastPosition(mediaQuery);
        
        document.body.appendChild(toastContainer);
      }
      return toastContainer;
    }
    
    function showToast(message, type = 'success', duration = 4000) {
      const container = ensureToastContainer();
      const toastId = ++toastCounter;
      
      const toast = document.createElement('div');
      toast.className = `chat-ia__toast chat-ia__toast--${type}`;
      toast.id = `toast-${toastId}`;
      
      // Styles for toast
      const baseStyles = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        margin-bottom: 8px;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        max-width: min(400px, calc(100vw - 32px));
        width: 100%;
        box-sizing: border-box;
        word-wrap: break-word;
        pointer-events: auto;
        transform: ${window.matchMedia('(max-width: 768px)').matches ? 'translateY(-20px)' : 'translateX(100%)'};
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 1px solid rgba(255, 255, 255, 0.1);
      `;
      
      const typeStyles = {
        success: `
          background: rgba(0, 0, 0, 0.92);
          color: white;
        `,
        error: `
          background: rgba(0, 0, 0, 0.92);
          color: white;
        `,
        info: `
          background: rgba(0, 0, 0, 0.92);
          color: white;
        `
      };
      
      toast.style.cssText = baseStyles + (typeStyles[type] || typeStyles.info);
      
      toast.innerHTML = `
        <span class="chat-ia__toast-message" style="flex: 1;">
          ${message}
        </span>
        <button class="chat-ia__toast-close" style="
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          cursor: pointer;
          padding: 4px;
          margin-left: 8px;
          flex-shrink: 0;
          transition: color 0.2s;
          border-radius: 2px;
        " onmouseover="this.style.color='rgba(255, 255, 255, 0.9)'; this.style.backgroundColor='rgba(255, 255, 255, 0.1)';" onmouseout="this.style.color='rgba(255, 255, 255, 0.6)'; this.style.backgroundColor='transparent';">
          ×
        </button>
      `;
      
      // Add close functionality
      const closeBtn = toast.querySelector('.chat-ia__toast-close');
      closeBtn.addEventListener('click', () => removeToast(toastId));
      
      container.appendChild(toast);
      
      // Animate in with responsive transform
      requestAnimationFrame(() => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
          toast.style.transform = 'translateY(0)';
          // Set initial mobile transform
          toast.style.transform = 'translateY(-20px)';
          requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
          });
        } else {
          toast.style.transform = 'translateX(0)';
          toast.style.opacity = '1';
        }
      });
      
      // Auto remove after duration
      if (duration > 0) {
        setTimeout(() => removeToast(toastId), duration);
      }
      
      return toastId;
    }
    
    function removeToast(toastId) {
      const toast = document.getElementById(`toast-${toastId}`);
      if (toast) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (isMobile) {
          toast.style.transform = 'translateY(-20px)';
        } else {
          toast.style.transform = 'translateX(100%)';
        }
        toast.style.opacity = '0';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    }
    
    return {
      success: (message, duration) => showToast(message, 'success', duration),
      error: (message, duration) => showToast(message, 'error', duration),
      info: (message, duration) => showToast(message, 'info', duration),
      remove: removeToast
    };
  }
  
  // Global toast instance
  const Toast = createToastSystem();

  // La función validateCaseStudySynchronization() se moverá después de definir caseStudiesDB

  // URLs constantes para evitar duplicación - SOLO casos válidos
  const CASE_STUDY_URLS = [
    'https://arcticgrey.com/pages/case-study-albee-baby',
    'https://arcticgrey.com/pages/case-study-wipstitch',
    'https://arcticgrey.com/pages/case-study-hiya-health',
    'https://arcticgrey.com/pages/case-study-iceman',
    'https://arcticgrey.com/pages/case-study-geometry',
    'https://arcticgrey.com/pages/case-study-di-bruno',
    'https://arcticgrey.com/pages/case-study-lancer-skincare',
    'https://arcticgrey.com/pages/case-study-goodwynns',
    'https://arcticgrey.com/pages/case-study-olaplex',
    'https://arcticgrey.com/pages/case-study-ronaldo-jewelry',
    'https://arcticgrey.com/pages/case-study-botany-farms',
    'https://arcticgrey.com/pages/case-study-headbanger',
    'https://arcticgrey.com/pages/case-study-kan-dana',
    'https://arcticgrey.com/pages/case-study-everlast?token=ag_specific_user-access-only',
    'https://arcticgrey.com/pages/case-study-lids-customizer?token=ag_specific_user-access-only',
    'https://arcticgrey.com/pages/case-study-lids-membership?token=ag_specific_user-access-only',
    'https://arcticgrey.com/blogs/case-study/bark?token=ag_specific_user-access-only',
    'https://arcticgrey.com/blogs/case-study/eby-by-sofia-vergara?token=ag_specific_user-access-only',
    'https://arcticgrey.com/blogs/case-study/harvard-university?token=ag_specific_user-access-only',
    'https://arcticgrey.com/pages/case-study-bertello?token=ag_specific_user-access-only',
    'https://arcticgrey.com/pages/case-study-the-cashmere-sale?token=ag_specific_user-access-only',
    'https://arcticgrey.com/pages/case-study-lids?token=ag_specific_user-access-only',
    'https://arcticgrey.com/pages/case-study-dr-green-life?token=ag_specific_user-access-only'
  ];

  // Case studies database - SOLO casos con imágenes válidas
  const caseStudiesDB = {
    albee: {
      id: 'albee',
      title: 'Albee Baby - Shopify Migration',
      description: '159% conversion increase, 49% sales growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-albee.png?v=1754986373',
      url: 'https://arcticgrey.com/pages/case-study-albee-baby',
      keywords: ['albee', 'baby', 'products', 'family', 'migration', 'yahoo'],
      color: '#F59E0B'
    },
    wipstitch: {
      id: 'wipstitch',
      title: 'Wipstitch - Revenue Transformation',
      description: '127% conversion increase, 187% sales growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-wipstitch.png?v=1754986346',
      url: 'https://arcticgrey.com/pages/case-study-wipstitch',
      keywords: ['wipstitch', 'needlework', 'crafting', 'supplies', 'stitching'],
      color: '#06B6D4'
    },
    hiya: {
      id: 'hiya',
      title: 'Hiya Health - Subscription Management',
      description: '65% subscription retention, 47% sales increase',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/hiya-logo.png?v=1746175778',
      url: 'https://arcticgrey.com/pages/case-study-hiya-health',
      keywords: ['hiya', 'health', 'children', 'supplements', 'nutrition', 'recharge'],
      color: '#10B981'
    },
    iceman: {
      id: 'iceman',
      title: 'Iceman - Delivery Platform',
      description: '41% sales increase, 24% order fulfillment boost',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-smart-iceman.png?v=1754986328',
      url: 'https://arcticgrey.com/pages/case-study-iceman',
      keywords: ['iceman', 'ice', 'snow', 'delivery', 'services', 'geo-location'],
      color: '#3B82F6'
    },
    geometry: {
      id: 'geometry',
      title: 'Geometry - Home & Kitchen Products',
      description: '37% sales increase, 76% order growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-geometry.png?v=1754986355',
      url: 'https://arcticgrey.com/pages/case-study-geometry',
      keywords: ['geometry', 'home', 'kitchen', 'products', 'membership', 'recycling'],
      color: '#84CC16'
    },
    dibruno: {
      id: 'dibruno',
      title: 'Di Bruno Bros - B2B & B2C Platform',
      description: '84% sales increase, 40% order growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/di-bruno-logo.png?v=1744966992',
      url: 'https://arcticgrey.com/pages/case-study-di-bruno',
      keywords: ['di', 'bruno', 'bros', 'gourmet', 'food', 'specialty', 'culinary', 'b2b'],
      color: '#EF4444'
    },
    lancer: {
      id: 'lancer',
      title: 'Lancer Skincare - Magento Migration',
      description: '53% order increase, 15% retention improvement',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/Lancer_Skincare.png?v=1755027136',
      url: 'https://arcticgrey.com/pages/case-study-lancer-skincare',
      keywords: ['lancer', 'skincare', 'beauty', 'products', 'magento', 'migration'],
      color: '#F97316'
    },
    goodwynns: {
      id: 'goodwynns',
      title: 'Goodwynns - Outdoor Equipment',
      description: '100% conversion increase, 95% sales growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/goodwynns-logo.png?v=1741859563',
      url: 'https://arcticgrey.com/pages/case-study-goodwynns',
      keywords: ['goodwynns', 'outdoor', 'adventure', 'equipment', 'membership', 'rental'],
      color: '#059669'
    },
    olaplex: {
      id: 'olaplex',
      title: 'Olaplex - Hair Care Optimization',
      description: '22% conversion increase, 37% sales growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/Group_1000004337.png?v=1755023168',
      url: 'https://arcticgrey.com/pages/case-study-olaplex',
      keywords: ['olaplex', 'hair', 'care', 'professional', 'products'],
      color: '#7C3AED'
    },
    ronaldo: {
      id: 'ronaldo',
      title: 'Ronaldo Jewelry - Luxury Accessories',
      description: '250% sales increase, 100% conversion boost',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-ronaldo.png?v=1754986382',
      url: 'https://arcticgrey.com/pages/case-study-ronaldo-jewelry',
      keywords: ['ronaldo', 'jewelry', 'fine', 'luxury', 'accessories'],
      color: '#DC2626'
    },
    botany: {
      id: 'botany',
      title: 'Botanyfarms - CBD & Wellness',
      description: '152% conversion improvement, 23% sales increase',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/Frame_38562_7d6a92f4-783b-4313-aca0-ceb7dc65ad84.png?v=1726813013',
      url: 'https://arcticgrey.com/pages/case-study-botany-farms',
      keywords: ['botanyfarms', 'botany', 'farms', 'cbd', 'wellness', 'products'],
      color: '#16A34A'
    },
    hbs: {
      id: 'hbs',
      title: 'HBS Sports Inc. - Athletic Gear',
      description: '37% sales increase, 76% order growth',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-hbs.png?v=1754986420',
      url: 'https://arcticgrey.com/pages/case-study-headbanger',
      keywords: ['hbs', 'sports', 'headbanger', 'athletic', 'gear', 'equipment'],
      color: '#0891B2'
    },
    kendana: {
      id: 'kendana',
      title: 'Ken & Dana Design - Fine Jewelry',
      description: '82% conversion improvement, 41% sales increase',
      image: 'https://cdn.shopify.com/s/files/1/0695/0102/6588/files/all-case-study-ken-dana.png?v=1754986403',
      url: 'https://arcticgrey.com/pages/case-study-kan-dana',
      keywords: ['ken', 'dana', 'design', 'fine', 'jewelry', 'engagement', 'rings'],
      color: '#BE185D'
    },
    everlast: {
      id: 'everlast',
      title: 'Everlast - Microsoft D365 ERP Migration',
      description: '152% conversion increase, D365 integration',
      image: 'https://arcticgrey.com/cdn/shop/files/everlast-banner.png?v=1721714026',
      url: 'https://arcticgrey.com/pages/case-study-everlast?token=ag_specific_user-access-only',
      keywords: ['everlast', 'microsoft', 'd365', 'erp', 'integration', 'sports'],
      color: '#DC2626'
    },
    lidscustomizer: {
      id: 'lidscustomizer',
      title: 'Lids - Product Customizer',
      description: '120% conversion increase, 88% sales boost',
      image: 'https://arcticgrey.com/cdn/shop/files/banner-desktop_fa6c7ac0-7fd5-446e-bc9d-5cb44ea6a02d.png?v=1718342532',
      url: 'https://arcticgrey.com/pages/case-study-lids-customizer?token=ag_specific_user-access-only',
      keywords: ['lids', 'customizer', 'personalization', 'product', 'custom', 'sports'],
      color: '#F59E0B'
    },
    lidsmembership: {
      id: 'lidsmembership',
      title: 'Lids - Membership Program',
      description: '18% sales increase, loyalty program',
      image: 'https://arcticgrey.com/cdn/shop/files/banner-desktop_fa6c7ac0-7fd5-446e-bc9d-5cb44ea6a02d.png?v=1718342532',
      url: 'https://arcticgrey.com/pages/case-study-lids-membership?token=ag_specific_user-access-only',
      keywords: ['lids', 'membership', 'loyalty', 'program', 'sports', 'retention'],
      color: '#8B5CF6'
    },
    barkbox: {
      id: 'barkbox',
      title: 'Bark Box - NetSuite ERP Migration',
      description: '89% conversion improvement, NetSuite integration',
      image: 'https://arcticgrey.com/cdn/shop/files/challenge_main_image_2048x2048_b09aeb76-a018-4d71-a389-c8ab6cac8dc7_2048x2048.webp?v=1674549863',
      url: 'https://arcticgrey.com/blogs/case-study/bark?token=ag_specific_user-access-only',
      keywords: ['barkbox', 'bark', 'netsuite', 'erp', 'subscription', 'pets'],
      color: '#10B981'
    },
    ebysofia: {
      id: 'ebysofia',
      title: 'Eby by Sofia Vergara - Celebrity Brand',
      description: '46% conversion increase, celebrity fashion',
      image: 'https://arcticgrey.com/cdn/shop/files/about_image_2048x2048_751a98d6-983c-4b8e-82eb-37fb21e1881b_2048x2048.webp?v=1674549697',
      url: 'https://arcticgrey.com/blogs/case-study/eby-by-sofia-vergara?token=ag_specific_user-access-only',
      keywords: ['eby', 'sofia', 'vergara', 'celebrity', 'fashion', 'brand'],
      color: '#EC4899'
    },
    harvard: {
      id: 'harvard',
      title: 'Harvard University - Educational Platform',
      description: '19% AOV increase, institutional excellence',
      image: 'https://arcticgrey.com/cdn/shop/files/harvard_main_image_2048x2048_b6b9b1f9-db66-43ae-a25c-b35e2de8db89_2048x2048.webp?v=1674550080',
      url: 'https://arcticgrey.com/blogs/case-study/harvard-university?token=ag_specific_user-access-only',
      keywords: ['harvard', 'university', 'education', 'academic', 'institutional', 'learning'],
      color: '#7C2D12'
    },
    bertello: {
      id: 'bertello',
      title: 'Shark Tank - Bertello Pizza Ovens',
      description: '47% sales increase, TV featured brand',
      image: 'https://arcticgrey.com/cdn/shop/files/bertello-best-seller-comp.png?v=1708593411',
      url: 'https://arcticgrey.com/pages/case-study-bertello?token=ag_specific_user-access-only',
      keywords: ['bertello', 'shark', 'tank', 'tv', 'pizza', 'ovens'],
      color: '#F97316'
    },
    cashmere: {
      id: 'cashmere',
      title: 'The Cashmere Sale - Luxury Fashion',
      description: '22% sales increase, luxury retail',
      image: 'https://arcticgrey.com/cdn/shop/files/transformation-image-new-2.png?v=1692244897',
      url: 'https://arcticgrey.com/pages/case-study-the-cashmere-sale?token=ag_specific_user-access-only',
      keywords: ['cashmere', 'sale', 'luxury', 'fashion', 'retail', 'premium'],
      color: '#6366F1'
    },
    ebbets: {
      id: 'ebbets',
      title: 'Ebbets Field Flannels - Vintage Sports',
      description: '24% conversion increase, authentic apparel',
      image: 'https://arcticgrey.com/cdn/shop/files/authentic-comp.png?v=1706770041',
      url: 'https://arcticgrey.com/pages/case-study-lids?token=ag_specific_user-access-only',
      keywords: ['ebbets', 'vintage', 'sports', 'apparel', 'authentic', 'baseball'],
      color: '#059669'
    },
    drgreen: {
      id: 'drgreen',
      title: 'Dr. Green Life - Health & Wellness',
      description: '249% conversion improvement, health products',
      image: 'https://arcticgrey.com/cdn/shop/files/green-life-35.png?v=1708930384',
      url: 'https://arcticgrey.com/pages/case-study-dr-green-life?token=ag_specific_user-access-only',
      keywords: ['doctor', 'green', 'life', 'health', 'wellness', 'medical'],
      color: '#16A34A'
    }
  };

  // ===== VALIDACIÓN DE SINCRONIZACIÓN =====
  
  function validateCaseStudySynchronization() {
    
    // Obtener todas las keywords de detectMentionedCaseStudy
    const detectionKeywords = {
      'albee baby': 'albee', 'albee': 'albee',
      'wipstitch': 'wipstitch',
      'hiya health': 'hiya', 'hiya': 'hiya',
      'iceman': 'iceman', 'smart iceman': 'iceman',
      'geometry': 'geometry',
      'di bruno bros': 'dibruno', 'di bruno': 'dibruno', 'dibruno': 'dibruno',
      'lancer skincare': 'lancer', 'lancer': 'lancer',
      'goodwynns': 'goodwynns',
      'olaplex': 'olaplex',
      'ronaldo jewelry': 'ronaldo', 'ronaldo': 'ronaldo',
      'botanyfarms': 'botany', 'botany farms': 'botany', 'botany': 'botany',
      'hbs sports': 'hbs', 'headbanger': 'hbs', 'hbs': 'hbs',
      'ken & dana design': 'kendana', 'ken dana': 'kendana', 'kendana': 'kendana',
      'everlast': 'everlast',
      'lids customizer': 'lidscustomizer', 'lidscustomizer': 'lidscustomizer',
      'lids membership': 'lidsmembership', 'lidsmembership': 'lidsmembership',
      'bark box': 'barkbox', 'barkbox': 'barkbox',
      'eby by sofia vergara': 'ebysofia', 'eby sofia vergara': 'ebysofia', 'ebysofia': 'ebysofia',
      'harvard university': 'harvard', 'harvard': 'harvard',
      'shark tank bertello': 'bertello', 'bertello': 'bertello',
      'the cashmere sale': 'cashmere', 'cashmere sale': 'cashmere', 'cashmere': 'cashmere',
      'ebbets field flannels': 'ebbets', 'ebbets': 'ebbets',
      'dr. green life': 'drgreen', 'dr green life': 'drgreen', 'drgreen': 'drgreen', 
      'dr green': 'drgreen', 'green life': 'drgreen', 'doctor green': 'drgreen'
    };
    
    const detectedIds = new Set(Object.values(detectionKeywords));
    const databaseIds = new Set(Object.keys(caseStudiesDB));
    
    // Verificar que todos los IDs detectables estén en la database
    const missingInDB = [...detectedIds].filter(id => !databaseIds.has(id));
    const missingInDetection = [...databaseIds].filter(id => !detectedIds.has(id));
    
    
    if (missingInDB.length > 0 || missingInDetection.length > 0) {
      console.error('🚨 CASE STUDY SYNCHRONIZATION ERROR!');
      console.error('Fix needed to ensure AI mentions match UI display');
      return false;
    }
    
    return true;
  }

  // ===== EXTRACCIÓN ESTRUCTURADA DE CASE STUDIES =====
  
  function extractCaseStudyFromAIResponse(aiContent) {
    
    try {
      // Buscar JSON en la respuesta de la IA
      let jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/);
      let jsonStr = '';
      
      if (jsonMatch && jsonMatch[1]) {
        jsonStr = jsonMatch[1].trim();
      } else {
        // Buscar JSON sin markdown
        const jsonPattern = /\{\s*"extractedData"\s*:\s*\{[\s\S]*?\}\s*\}/g;
        let match;
        let lastMatch = null;
        
        while ((match = jsonPattern.exec(aiContent)) !== null) {
          lastMatch = match;
        }
        
        if (lastMatch) {
          jsonStr = lastMatch[0].trim();
        }
      }
      
      if (jsonStr) {
        const parsedData = JSON.parse(jsonStr);
        
        if (parsedData.extractedData && parsedData.extractedData.caseStudyToShow) {
          const caseStudyId = parsedData.extractedData.caseStudyToShow.trim();
          
          if (caseStudyId === 'empty_string' || caseStudyId === '') {
            return null;
          }
          
          
          if (caseStudiesDB[caseStudyId]) {
            return caseStudyId;
          } else {
            console.error(`❌ INVALID: Case study "${caseStudyId}" not found in database`);
            console.error('Available IDs:', Object.keys(caseStudiesDB));
            return null;
          }
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error parsing AI JSON for case study:', error);
      return null;
    }
  }

  // Ejecutar validación después de definir caseStudiesDB
  validateCaseStudySynchronization();

  // Función simple para extraer contexto básico (solo lo esencial)
  function extractUserContext(conversationHistory) {
    const fullText = conversationHistory.join(' ').toLowerCase();
    return {
      industry: null, // Ya no necesario con sistema simplificado
      projectType: null,
      currentPlatform: null,
      specialFeatures: []
    };
  }

  // FUNCIÓN SIMPLIFICADA - Sistema híbrido inteligente pero simple
  function selectRelevantCaseStudies(userContext, projectType, industry, messageCount, shownCaseStudies, messageContent = '') {
    const text = (messageContent || '').toLowerCase();
    
    // Reglas inteligentes actualizadas con nuevos case studies
    const smartRules = [
      { keywords: ['migrate', 'migration', 'switch', 'move from', 'magento', 'woocommerce'], cases: ['albee', 'lancer', 'everlast'] },
      { keywords: ['b2b', 'wholesale', 'business', 'corporate', 'bulk'], cases: ['dibruno'] },
      { keywords: ['subscription', 'recurring', 'membership', 'monthly', 'recharge'], cases: ['hiya', 'barkbox', 'lidsmembership'] },
      { keywords: ['luxury', 'premium', 'high-end', 'exclusive', 'jewelry'], cases: ['ronaldo', 'kendana', 'cashmere'] },
      { keywords: ['performance', 'speed', 'optimization', 'fast', 'conversion'], cases: ['olaplex', 'lancer', 'drgreen'] },
      { keywords: ['erp', 'integration', 'netsuite', 'microsoft', 'd365', 'enterprise'], cases: ['everlast', 'barkbox'] },
      { keywords: ['customization', 'personalization', 'custom', 'product'], cases: ['lidscustomizer'] },
      { keywords: ['celebrity', 'famous', 'influencer', 'brand'], cases: ['ebysofia'] },
      { keywords: ['education', 'university', 'academic', 'institutional'], cases: ['harvard'] },
      { keywords: ['tv', 'shark tank', 'featured', 'television'], cases: ['bertello'] },
      { keywords: ['vintage', 'authentic', 'classic', 'traditional'], cases: ['ebbets'] },
      { keywords: ['health', 'medical', 'wellness', 'doctor'], cases: ['drgreen'] },
      { keywords: ['sports', 'athletic', 'fitness', 'gear'], cases: ['everlast', 'lidscustomizer', 'ebbets'] }
    ];
    
    // Buscar coincidencia en el mensaje actual
    for (const rule of smartRules) {
      if (rule.keywords.some(keyword => text.includes(keyword))) {
        const available = rule.cases.filter(id => !shownCaseStudies.includes(id));
        if (available.length > 0) {
          const selectedId = available[Math.floor(Math.random() * available.length)];
          return [caseStudiesDB[selectedId]];
        }
      }
    }
    
    // Fallback aleatorio simple - evitar últimos 2 mostrados
    const allAvailable = Object.keys(caseStudiesDB).filter(id => 
      !shownCaseStudies.slice(-2).includes(id) && caseStudiesDB[id]
    );
    
    if (allAvailable.length === 0) {
      return [];
    }
    
    const selectedId = allAvailable[Math.floor(Math.random() * allAvailable.length)];
    return [caseStudiesDB[selectedId]];
  }


  function createCaseStudyCard(caseStudy, ctaText = 'View Case Study') {
    if (!caseStudy) {
      console.error('❌ ERROR - caseStudy is null or undefined');
      return '';
    }
    
    // 🔍 DEBUG: Verificar específicamente la imagen
    
    // Validar que la imagen existe
    const imageUrl = caseStudy.image && caseStudy.image.trim() !== '' ? caseStudy.image : '';
    
    
    // Construir el style de forma más segura
    const backgroundStyle = imageUrl ? 
      `background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;` :
      'background-color: #f0f0f0;'; // Fallback si no hay imagen
    
    return `
      <div class="chat-ia__case-study-card" data-case-study="${caseStudy.id || 'unknown'}">
        <div class="chat-ia__case-study-image">
          <div class="chat-ia__case-study-bg" style="${backgroundStyle} width: 100%; height: 100%; min-height: 120px;">
          </div>
          <div class="chat-ia__case-study-overlay">
            <div class="chat-ia__case-study-icon" style="background-color: ${caseStudy.color || '#666'}">
            </div>
          </div>
        </div>
        <div class="chat-ia__case-study-content">
          <h4 class="chat-ia__case-study-title">${caseStudy.title || 'Case Study'}</h4>
          <p class="chat-ia__case-study-description">${caseStudy.description || 'Success story'}</p>
          <a href="${caseStudy.url || '#'}" target="_blank" class="chat-ia__case-study-button">
            ${ctaText}
            <span class="chat-ia__case-study-arrow">→</span>
          </a>
        </div>
      </div>
    `;
  }

  // Nueva función para crear múltiples case studies
  // Función para detectar oportunidades de mostrar case studies DESPUÉS de capturar email y empresa
  function shouldShowCaseStudies(content, messageCount, conversationHistory) {
    const contentLower = content.toLowerCase();
    const fullConversation = conversationHistory.join(' ').toLowerCase();
    
    // VERIFICACIÓN PREVIA SIMPLIFICADA: Solo verificar que haya un email capturado
    const hasEmailCapture = fullConversation.includes('@');
    
    // Si no hay email capturado, definitivamente no mostrar case studies
    if (!hasEmailCapture) {
      console.log('❌ No email captured yet, skipping case study check');
      return { shouldShow: false, triggerPoint: null, reason: 'no_email' };
    }
    
    
    // DETECCIÓN SUPER ESPECÍFICA: Solo frases que EXPLÍCITAMENTE mencionan case studies
    const directCaseStudyPhrases = [
      'let me show you some relevant case studies',
      'let me show you some case studies',
      'here are some relevant case studies',
      'here are some case studies',
      'i\'ll show you some case studies',
      'relevant case studies from',
      'case studies from similar',
      'take a look at these case studies',
      'check out these case studies'
    ];
    
    // Verificar si la IA menciona EXPLÍCITAMENTE case studies
    const explicitlyMentionsCaseStudies = directCaseStudyPhrases.some(phrase => 
      contentLower.includes(phrase)
    );
    
    if (explicitlyMentionsCaseStudies) {
      console.log('✅ Explicit case study mention detected');
      return { shouldShow: true, triggerPoint: 'explicit_mention', reason: 'ai_explicitly_mentioned_case_studies' };
    }
    
    // Si la IA no menciona explícitamente case studies, NO MOSTRAR
    console.log('❌ No explicit case study mention, not showing');
    return { shouldShow: false, triggerPoint: null, reason: 'no_explicit_mention' };
  }
  
  // Función legacy removida - ahora usamos shouldShowCaseStudies() para detección flexible

  // Función simplificada para detectar case studies mencionados EN EL TEXTO VISIBLE
  function detectMentionedCaseStudy(content) {
    const contentLower = content.toLowerCase();
    
    // Primero, limpiar el contenido de JSON extractedData
    let cleanContent = contentLower;
    cleanContent = cleanContent.replace(/```json[\s\S]*?"extractedData"[\s\S]*?```/g, '');
    cleanContent = cleanContent.replace(/\{\s*"extractedData"\s*:\s*\{[\s\S]*?\}\s*\}/g, '');
    
    console.log('🔍 Detecting case study from visible content:', cleanContent.substring(0, 200));
    
    // TODOS los casos válidos y sus variaciones - SINCRONIZADO con caseStudiesDB
    const caseStudyKeywords = {
      // Casos básicos
      'albee baby': 'albee', 'albee': 'albee',
      'wipstitch': 'wipstitch',
      'hiya health': 'hiya', 'hiya': 'hiya',
      'iceman': 'iceman', 'smart iceman': 'iceman',
      'geometry': 'geometry',
      'di bruno bros': 'dibruno', 'di bruno': 'dibruno', 'dibruno': 'dibruno',
      'lancer skincare': 'lancer', 'lancer': 'lancer',
      'goodwynns': 'goodwynns',
      'olaplex': 'olaplex',
      'ronaldo jewelry': 'ronaldo', 'ronaldo': 'ronaldo',
      'botanyfarms': 'botany', 'botany farms': 'botany', 'botany': 'botany',
      'hbs sports': 'hbs', 'headbanger': 'hbs', 'hbs': 'hbs',
      'ken & dana design': 'kendana', 'ken dana': 'kendana', 'kendana': 'kendana',
      
      // Casos premium/privados
      'everlast': 'everlast',
      'lids customizer': 'lidscustomizer', 'lidscustomizer': 'lidscustomizer',
      'lids membership': 'lidsmembership', 'lidsmembership': 'lidsmembership',
      'bark box': 'barkbox', 'barkbox': 'barkbox',
      'eby by sofia vergara': 'ebysofia', 'eby sofia vergara': 'ebysofia', 'ebysofia': 'ebysofia',
      'harvard university': 'harvard', 'harvard': 'harvard',
      'shark tank bertello': 'bertello', 'bertello': 'bertello',
      'the cashmere sale': 'cashmere', 'cashmere sale': 'cashmere', 'cashmere': 'cashmere',
      'ebbets field flannels': 'ebbets', 'ebbets': 'ebbets',
      'dr. green life': 'drgreen', 'dr green life': 'drgreen', 'drgreen': 'drgreen', 
      'dr green': 'drgreen', 'green life': 'drgreen', 'doctor green': 'drgreen'
    };
    
    // Buscar menciones (ordenar por longitud para priorizar frases completas)
    const sortedKeywords = Object.entries(caseStudyKeywords)
      .sort(([a], [b]) => b.length - a.length);
    
    
    // ENHANCED DETECTION: Verificar cada keyword en el contenido LIMPIO
    for (const [keyword, caseStudyId] of sortedKeywords) {
      const keywordFound = cleanContent.includes(keyword);
      const databaseExists = caseStudiesDB[caseStudyId];
      
      if (keywordFound && databaseExists) {
        console.log(`✅ Case study detected: "${keyword}" -> ${caseStudyId}`);
        return caseStudiesDB[caseStudyId];
      }
      
      // Log para debugging cuando no encuentra
      if (keywordFound && !databaseExists) {
        console.error(`❌ Keyword found but no database entry: "${keyword}" -> ${caseStudyId}`);
      }
    }
    
    // FALLBACK: Buscar patrones más flexibles para casos problemáticos (usando cleanContent)
    
    // Específico para Dr. Green Life
    if (cleanContent.includes('dr') && cleanContent.includes('green') && cleanContent.includes('life')) {
      console.log('✅ Case study detected (flexible): Dr. Green Life');
      return caseStudiesDB['drgreen'];
    }
    
    // Otros patrones flexibles
    const flexiblePatterns = [
      { pattern: /lancer.*skincare|skincare.*lancer/i, id: 'lancer' },
      { pattern: /albee.*baby|baby.*albee/i, id: 'albee' },
      { pattern: /ken.*dana|dana.*ken/i, id: 'kendana' },
      { pattern: /di.*bruno|bruno.*bros/i, id: 'dibruno' },
      { pattern: /bark.*box|box.*bark/i, id: 'barkbox' },
      { pattern: /eby.*sofia|sofia.*vergara/i, id: 'ebysofia' }
    ];
    
    for (const { pattern, id } of flexiblePatterns) {
      if (pattern.test(cleanContent) && caseStudiesDB[id]) {
        console.log(`✅ Case study detected (flexible pattern): ${id}`);
        return caseStudiesDB[id];
      }
    }
    
    console.log('❌ No case study detected in content');
    return null;
  }

  // Función simplificada para crear case study cards
  function createMultipleCaseStudyCards(caseStudies) {
    if (!caseStudies || caseStudies.length === 0) return '';
    
    const ctas = [
      'See Similar Results',
      'View Success Story', 
      'Learn How They Did It',
      'See Full Case Study',
      'Discover Their Strategy'
    ];
    
    const randomCta = ctas[Math.floor(Math.random() * ctas.length)];
    
    return `
      <div class="chat-ia__case-studies-container">
        <h4 class="chat-ia__case-studies-title">Relevant Success Stories</h4>
        <div class="chat-ia__case-studies-grid">
          ${caseStudies.map(caseStudy => createCaseStudyCard(caseStudy, randomCta)).join('')}
        </div>
      </div>
    `;
  }

  function createJakeCard() {
    return `
      <div class="chat-ia__case-study-card chat-ia__jake-card" data-card-type="jake">
        <div class="chat-ia__case-study-image">
          <img src="https://arcticgrey.com/cdn/shop/files/Jack.png?v=1752753546&width=500" alt="Jake Amos" loading="lazy">
          <div class="chat-ia__case-study-overlay">
            <div class="chat-ia__case-study-icon" style="background-color: #2563EB">
            </div>
          </div>
        </div>
        <div class="chat-ia__case-study-content">
          <h4 class="chat-ia__case-study-title">Jake Amos</h4>
          <p class="chat-ia__case-study-description">Co-Founder Arctic Grey</p>
          <a href="https://calendly.com/arcticgrey-jake/15min" target="_blank" class="chat-ia__case-study-button">
            Schedule a Call
            <span class="chat-ia__case-study-arrow">→</span>
          </a>
        </div>
      </div>
    `;
  }
  
  // ===== MESSAGE SPLITTING FOR BETTER READABILITY =====
  
  function splitMessageIntoChunks(content) {
    if (!content || typeof content !== 'string' || content.trim() === '') {
      console.warn('⚠️ Empty or invalid content for splitting:', content);
      return [];
    }
    
    // Clean the content first
    let cleanContent = content.trim();
    
    // If content is too short, don't split
    if (cleanContent.length < 20) {
      return [cleanContent];
    }
    
    // Split by common sentence endings followed by capital letters or questions
    const sentenceEndings = [
      /([.!?])\s+([A-Z])/g,  // Period/exclamation/question followed by capital letter
      /([.!?])\s+([a-z])/g,  // Period/exclamation/question followed by lowercase (for questions like "What's")
      /(\n\n)/g,             // Double line breaks
      /(\n)/g                // Single line breaks
    ];
    
    // Try to split by sentence boundaries first
    let chunks = [];
    let currentChunk = cleanContent;
    
    // Split by double line breaks first (paragraphs)
    const paragraphs = currentChunk.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length > 1) {
      chunks = paragraphs.map(p => p.trim());
    } else {
      // Split by sentence endings
      const sentences = currentChunk.split(/([.!?])\s+/).filter(s => s.trim().length > 0);
      
      if (sentences.length > 1) {
        // Reconstruct sentences with their punctuation
        chunks = [];
        for (let i = 0; i < sentences.length; i += 2) {
          if (i + 1 < sentences.length) {
            chunks.push((sentences[i] + sentences[i + 1]).trim());
          } else {
            chunks.push(sentences[i].trim());
          }
        }
      } else {
        // Fallback: split by single line breaks
        chunks = currentChunk.split(/\n/).filter(c => c.trim().length > 0);
      }
    }
    
    // Filter out very short chunks (less than 10 characters) unless they're questions
    chunks = chunks.filter(chunk => {
      const trimmed = chunk.trim();
      return trimmed.length >= 10 || trimmed.endsWith('?') || trimmed.endsWith('!');
    });
    
    // If we still have only one chunk or chunks are too long, try to split further
    if (chunks.length === 1 && chunks[0].length > 200) {
      // Split long content by commas and conjunctions
      const longChunk = chunks[0];
      const splitPoints = [
        /,\s+(and|but|or|so|yet|for|nor)\s+/gi,
        /\.\s+(However|But|Also|Additionally|Moreover|Furthermore)\s+/gi,
        /;\s+/g,
        /,\s+/g
      ];
      
      let bestSplit = null;
      let bestSplitLength = 0;
      
      for (const pattern of splitPoints) {
        const matches = [...longChunk.matchAll(pattern)];
        for (const match of matches) {
          const splitIndex = match.index + match[0].length;
          const leftLength = longChunk.substring(0, splitIndex).length;
          const rightLength = longChunk.substring(splitIndex).length;
          
          // Prefer splits that create more balanced chunks
          if (leftLength >= 50 && rightLength >= 50 && 
              Math.abs(leftLength - rightLength) < Math.abs(bestSplitLength - 100)) {
            bestSplit = splitIndex;
            bestSplitLength = leftLength;
          }
        }
      }
      
      if (bestSplit) {
        chunks = [
          longChunk.substring(0, bestSplit).trim(),
          longChunk.substring(bestSplit).trim()
        ];
      }
    }
    
    // Final cleanup: remove any empty or whitespace-only chunks
    const finalChunks = chunks.filter(chunk => chunk && chunk.trim().length > 0);
    
    // If no valid chunks, return the original content
    if (finalChunks.length === 0) {
      console.warn('⚠️ No valid chunks found, returning original content');
      return cleanContent.length > 0 ? [cleanContent] : [];
    }
    
    return finalChunks;
  }

  function formatMessageContent(content) {
    // Add safety check for undefined/null content
    if (!content || typeof content !== 'string') {
      console.warn('formatMessageContent: Invalid content received:', content);
      return content || ''; // Return empty string if content is falsy
    }
    
    let formattedContent = content;
    
    // 1. Limpiar JSON extractedData de la UI
    formattedContent = formattedContent.replace(/```json[\s\S]*?"extractedData"[\s\S]*?```/g, '');
    formattedContent = formattedContent.replace(/\n*\s*\{\s*"extractedData"\s*:\s*\{[\s\S]*?\}\s*\}\s*$/g, '');
    formattedContent = formattedContent.replace(/\{[\s\S]*?"extractedData"[\s\S]*?\}/g, '');
    formattedContent = formattedContent.replace(/```\s*\{\s*"extractedData"[\s\S]*?\}\s*```/g, '');
    formattedContent = formattedContent.replace(/^.*"extractedData".*$/gm, '');
    formattedContent = formattedContent.replace(/\s*\}\s*$/, '');
    formattedContent = formattedContent.replace(/\n{3,}/g, '\n\n').trim();
    
    // 2. Remove markdown-style links
    formattedContent = formattedContent.replace(/\[([^\]]*)\]\(([^)]+)\)/g, '');
    formattedContent = formattedContent.replace(/\[\]\([^)]*\)/g, '');
    formattedContent = formattedContent.replace(/\[\]/g, '');
    
    // 3. Remove all case study URLs using global constant
    CASE_STUDY_URLS.forEach(url => {
      const regex = new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      formattedContent = formattedContent.replace(regex, '');
    });
    
    // 4. Remove partial URLs
    const partialUrlPatterns = [
      /https:\/\/ewt41d2ausfeb0eg-[^\s]*/g,
      /https:\/\/arcticgrey\.com\/[blogs|pages]\/case-study[^\s]*/g,
      /ewt41d2ausfeb0eg-[^\s]*/g
    ];
    
    partialUrlPatterns.forEach(pattern => {
      formattedContent = formattedContent.replace(pattern, '');
    });
    
    // 5. Create Jake card for Calendly
    let jakeCard = '';
    const containsCalendlyUrl = /https:\/\/calendly\.com\/[^\s]+/.test(formattedContent);
    if (containsCalendlyUrl) {
      jakeCard = createJakeCard();
    }

    // 6. Remove Calendly URLs from text (they're handled by Jake card)
    formattedContent = formattedContent.replace(
      /(https:\/\/calendly\.com\/[^\s]+)/g,
      ''
    );
    
    // 7. Remove any remaining generic HTTPS links to keep text clean
    formattedContent = formattedContent.replace(
      /(https:\/\/[^\s<>"]+)/g,
      ''
    );
    
    // 8. Detectar emails - aplicar gradiente a TODOS los emails encontrados
    formattedContent = formattedContent.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<span class="chat-ia__email-gradient">$1</span>'
    );
    
    // 9. Format bullet points * text to • text FIRST
    formattedContent = formattedContent.replace(/^\* (.+)$/gm, '• $1');
    
    // 10. Format **bold** text with stronger CSS AFTER bullet points
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<span style="font-weight: bold;">$1</span>');
    
    // 11. Clean up extra spaces and line breaks  
    formattedContent = formattedContent.replace(/\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    
    // 12. Add Jake card if needed (different from case studies)
    if (jakeCard) {
      formattedContent = formattedContent + '\n\n' + jakeCard;
    }
    
    // 13. Final cleanup
    formattedContent = formattedContent.trim();
    
    return formattedContent;
  }
  
  // ===== GESTIÓN DE MENSAJES =====
  
  function createMessageManager() {
    const messages = [
      {
        id: '1',
        type: 'ai',
        content: 'Hello! I\'m Milo from Arctic Grey. I\'m here to help you with any questions about our services, from Shopify migrations to custom development. How can I assist you today?',
        timestamp: new Date().toLocaleTimeString()
      }
    ];
    
    const listeners = [];
    const sessionId = generateSessionId();
    const shop = getShopFromUrl();
    const apiEndpoint = `/apps/quote-generator-main?shop=${shop}`;
    let uploadedFiles = [];
    let userMessageCount = 0; // Contador de mensajes del usuario
    let emailCaptured = false; // Si ya capturamos el email
    let chatBlocked = false; // Si el chat está bloqueado
    
    function addMessage(message) {
      messages.push(message);
      notifyListeners();
      
      // Si es un mensaje de typing, deshabilitar el input
      if (message.type === 'typing') {
        disableChatInput();
      }
    }
    
    function removeTypingMessage() {
      const typingIndex = messages.findIndex(msg => msg.type === 'typing');
      if (typingIndex !== -1) {
        messages.splice(typingIndex, 1);
        notifyListeners();
        
        // Cuando se remueve el typing, habilitar el input de nuevo
        enableChatInput();
      }
    }
    
    // Funciones para controlar el estado del input
    function disableChatInput() {
      if (typeof window.disableInput === 'function') {
        window.disableInput();
      }
    }
    
    function enableChatInput() {
      if (typeof window.enableInput === 'function') {
        window.enableInput();
      }
    }
    
    async function sendToProxy(message, taskData = null) {
      const formData = new FormData();
      
      // Solo lo esencial
      formData.append('message', message);
      formData.append('sessionId', sessionId);
      formData.append('shop', shop);
      formData.append('requestType', 'chat');
      
      // Agregar task type data si está disponible
      if (taskData) {
        formData.append('taskType', taskData.taskType);
        formData.append('taskTitle', taskData.taskTitle);
      }
      
      // Agregar archivos PDF si hay alguno cargado
      if (uploadedFiles.length > 0) {
        uploadedFiles.forEach((fileData) => {
          formData.append(`pdfFiles`, fileData.file);
        });
      }
      
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    }
    
    async function sendMessage(content) {
      return sendMessageWithTaskType(content, null);
    }
    
    async function sendMessageWithTaskType(content, taskData = null) {
      const userMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: content,
        timestamp: new Date().toLocaleTimeString()
      };
      
      addMessage(userMessage);
      
      // Incrementar contador de mensajes del usuario
      userMessageCount++;
      
      // Verificar si el mensaje contiene un email
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const emailDetectedInMessage = emailRegex.test(content);
      
      if (emailDetectedInMessage && !emailCaptured) {
        emailCaptured = true;
        
        // 🎯 Mostrar botón de Free Audit cuando el usuario proporciona email naturalmente
        setTimeout(() => {
          if (typeof window.showFreeAuditButton === 'function') {
            window.showFreeAuditButton();
          }
        }, 2500); // Mostrar después de la respuesta del bot
      }
      
      // Verificar si debemos bloquear el chat después del 3er mensaje sin email
      if (userMessageCount >= 3 && !emailCaptured && !chatBlocked) {
        chatBlocked = true;
        // Mostrar overlay de bloqueo pidiendo email
        setTimeout(() => {
          showEmailCaptureOverlay();
        }, 1500); // Mostrar después de la respuesta del bot
      }
      
      // Agregar mensaje de typing
      const typingMessage = {
        id: 'typing-' + Date.now(),
        type: 'typing',
        content: 'Milo is typing...',
        timestamp: new Date().toLocaleTimeString()
      };
      addMessage(typingMessage);
      
      try {
        const response = await sendToProxy(content, taskData);
        removeTypingMessage();
        
        if (response.success) {
          // Split AI response into multiple chunks for better readability
          const messageChunks = splitMessageIntoChunks(response.aiResponse);
          
          // Validate chunks - if empty or invalid, use original response
          if (!messageChunks || messageChunks.length === 0) {
            console.warn('⚠️ No valid chunks, using original response as single message');
            const aiMessage = {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: response.aiResponse,
              timestamp: new Date().toLocaleTimeString()
            };
            addMessage(aiMessage);
            checkAndAddCaseStudyMessage(response.aiResponse, messages);
            return;
          }
          
          // Add each chunk as a separate message with a small delay between them
          messageChunks.forEach((chunk, index) => {
            // Skip empty chunks
            if (!chunk || chunk.trim().length === 0) {
              console.warn('⚠️ Skipping empty chunk at index:', index);
              return;
            }
            
            setTimeout(() => {
              const aiMessage = {
                id: (Date.now() + index + 1).toString(),
                type: 'ai',
                content: chunk,
                timestamp: new Date().toLocaleTimeString(),
                isChunk: true, // Mark as chunk for styling
                chunkIndex: index,
                totalChunks: messageChunks.length
              };
              addMessage(aiMessage);
              
              // Check for case studies on the last chunk
              if (index === messageChunks.length - 1) {
                checkAndAddCaseStudyMessage(response.aiResponse, messages);
              }
            }, index * 800); // 800ms delay between chunks for natural feel
          });
        } else {
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment.',
            timestamp: new Date().toLocaleTimeString()
          };
          addMessage(errorMessage);
        }
      } catch (error) {
        console.error('Error sending message to proxy:', error);
        removeTypingMessage();
        
        const errorMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'I apologize, but I\'m experiencing some technical difficulties right now. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString()
        };
        addMessage(errorMessage);
      }
    }

    // EMERGENCY EMAIL CAPTURE FUNCTION REMOVED - No longer needed
    // Emergency emails are now only sent when user explicitly closes chat AND has provided email

    // 📧 EMAIL FALLBACK - Send only email when user closes modal/clicks outside AND has provided email
    async function sendEmailFallback(reason = 'modal_close') {
      try {

        // Get captured email (if any)
        const allMessages = messages.map(m => m.content).join(' ');
        const emailMatch = allMessages.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        const capturedEmail = emailMatch ? emailMatch[1] : '';
        
        // Validate email exists and is valid
        if (!capturedEmail || !capturedEmail.includes('@') || !capturedEmail.includes('.')) {
          console.log('⚠️ Email fallback skipped - no valid email provided');
          return { success: false, reason: 'no_valid_email' };
        }

        console.log('📧 Sending email fallback for user who closed chat:', capturedEmail);

        // Send only email to backend
        const formData = new FormData();
        formData.append('requestType', 'emailFallback');
        formData.append('sessionId', sessionId);
        formData.append('email', capturedEmail);
        formData.append('reason', reason);
        formData.append('shop', shop);

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Email fallback successful:', result);
        } else {
          console.log('❌ Email fallback failed:', result);
        }

        return result;

      } catch (error) {
        console.error('❌ Email fallback error:', error);
        return { success: false, error: error.message };
      }
    }
    
    function clearMessages() {
      messages.length = 0;
      messages.push({
        id: Date.now().toString(),
        type: 'ai',
        content: 'Hello! I\'m Milo from Arctic Grey. I\'m here to help you with any questions about our services, from Shopify migrations to custom development. How can I assist you today?',
        timestamp: new Date().toLocaleTimeString()
      });
      notifyListeners();
    }
    
    function onChange(listener) {
      listeners.push(listener);
    }
    
    function notifyListeners() {
      listeners.forEach(listener => listener(messages));
    }
    
    function getMessages() {
      return messages;
    }
    
    function handleFileUpload(event) {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      
      const maxFileSize = 100 * 1024 * 1024; // 100MB
      const allowedTypes = ["application/pdf"];
      
      let successCount = 0;
      let errorCount = 0;
      const errors = [];
      
      Array.from(files).forEach((file) => {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          errorCount++;
          errors.push(`${file.name}: Invalid file type. Only PDF files are allowed.`);
          Toast.error(`File type not supported: ${file.name}. Please upload PDF files only.`, 5000);
          return;
        }
        
        // Validate file size
        if (file.size > maxFileSize) {
          errorCount++;
          errors.push(`${file.name}: File too large (max 100MB).`);
          Toast.error(`File too large: ${file.name}. Maximum size is 100MB.`, 5000);
          return;
        }
        
        // Add file to uploaded files
        uploadedFiles.push({
          name: file.name,
          type: file.type,
          size: file.size,
          file: file,
        });
        successCount++;
      });
      
      // Show success toast for successfully uploaded files
      if (successCount > 0) {
        const fileWord = successCount === 1 ? 'file' : 'files';
        const sizeInfo = successCount === 1 
          ? ` (${(Array.from(files)[0].size / 1024 / 1024).toFixed(1)}MB)`
          : ` (${successCount} files)`;
        
        Toast.success(`PDF ${fileWord} uploaded successfully${sizeInfo}`, 4000);
        
        // Files will be shown via the automatic AI message, no need for individual file messages
        
        // Send automatic message to AI about the uploaded files
        setTimeout(() => {
          const uploadedFilesList = uploadedFiles.slice(-successCount);
          const fileNames = uploadedFilesList.map(f => f.name).join(', ');
          const fileMessage = successCount === 1 
            ? `I just uploaded a file: ${fileNames}. Please analyze it and let me know what you found.`
            : `I just uploaded ${successCount} files: ${fileNames}. Please analyze them and let me know what you found.`;
          
          // Send this message to the AI automatically
          sendMessage(fileMessage);
        }, 1000); // Small delay to feel more natural
      }
      
      // Clear the input so same file can be uploaded again if needed
      event.target.value = '';
    }
    
    function removeFile(index) {
      const removedFile = uploadedFiles[index];
      if (removedFile) {
        uploadedFiles.splice(index, 1);
        
        // Show toast notification for file removal
        Toast.info(`File "${removedFile.name}" has been removed`, 3000);
      }
    }
    
    // Función para verificar y agregar case studies como mensajes separados
    function checkAndAddCaseStudyMessage(aiContent, currentMessages) {
      // Esta función será llamada desde el scope de createChatInterface
      // donde tenemos acceso a shownCaseStudies y messageCount
      if (typeof window.handleCaseStudyCheck === 'function') {
        window.handleCaseStudyCheck(aiContent, currentMessages);
      }
    }
    
    // Función para mostrar el overlay de captura de email
    function showEmailCaptureOverlay() {
      // Esta función será llamada desde createChatInterface donde tenemos acceso al DOM
      if (typeof window.showEmailOverlay === 'function') {
        window.showEmailOverlay();
      }
    }
    
    // Función para desbloquear el chat después de capturar el email
    function unlockChatWithEmail(email) {
      emailCaptured = true;
      chatBlocked = false;
      
      // Ocultar el overlay
      if (typeof window.hideEmailOverlay === 'function') {
        window.hideEmailOverlay();
      }
      
      // Enviar al servidor (sendMessage ya agrega el mensaje del usuario)
      sendMessage(email);
      
      // Mostrar botón de "Free Audit" después de un delay
      setTimeout(() => {
        if (typeof window.showFreeAuditButton === 'function') {
          window.showFreeAuditButton();
        }
      }, 2000); // Mostrar después de 2s para que vea la respuesta del bot
    }
    
    return {
      addMessage,
      sendMessage,
      sendMessageWithTaskType,
      removeTypingMessage,
      checkAndAddCaseStudyMessage,
      clearMessages,
      onChange,
      getMessages,
      removeFile,
      handleFileUpload,
      sendEmailFallback,     // 📧 Export email fallback function only
      unlockChatWithEmail    // 🔓 Export unlock function for email capture
    };
  }
  
  // ===== GESTIÓN DE PARÁMETROS URL =====
  
  function createURLParamManager(paramName) {
    const listeners = [];
    let value = getCurrentValue();
    let lastCheckedValue = value;
    let urlCheckInterval;
    let isWindowActive = true;
    
    function getCurrentValue() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(paramName);
    }
    
    function setValue(newValue) {
      const url = new URL(window.location.href);
      if (newValue) {
        url.searchParams.set(paramName, newValue);
      } else {
        url.searchParams.delete(paramName);
      }
      
      window.history.pushState({}, '', url.toString());
      value = newValue;
      lastCheckedValue = newValue;
      notifyListeners();
    }
    
    function onChange(listener) {
      listeners.push(listener);
    }
    
    function notifyListeners() {
      listeners.forEach(listener => listener(value));
    }
    
    function getValue() {
      return value;
    }
    
    // ===== POLLING SIMPLE Y EFICIENTE =====
    
    function checkForUrlChanges() {
      const currentValue = getCurrentValue();
      if (currentValue !== lastCheckedValue) {
        value = currentValue;
        lastCheckedValue = currentValue;
        notifyListeners();
      }
    }
    
    function startPolling() {
      urlCheckInterval = setInterval(checkForUrlChanges, 100);
    }
    
    function stopPolling() {
      if (urlCheckInterval) {
        clearInterval(urlCheckInterval);
        urlCheckInterval = null;
      }
    }
    
    // Solo hacer polling cuando la ventana esté activa
    function handleVisibilityChange() {
      isWindowActive = !document.hidden;
      if (isWindowActive) {
        startPolling();
      } else {
        stopPolling();
      }
    }
    
    // Event listeners para cambios de URL (como respaldo)
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    
    function handleUrlChange() {
      const newValue = getCurrentValue();
      if (newValue !== value) {
        value = newValue;
        lastCheckedValue = newValue;
        notifyListeners();
      }
    }
    
    // Iniciar polling cuando la ventana esté activa
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Iniciar polling
    startPolling();
    
    return {
      setValue,
      onChange,
      getValue
    };
  }
  
  // ===== INTERFAZ PRINCIPAL DEL CHAT =====
  
  function createChatInterface(container) {
    const messageManager = createMessageManager();
    const urlManager = createURLParamManager('chatAi');
    let isModalOpen = false;
    
    // Case Study tracking for smart rotation
    let shownCaseStudies = [];
    let messageCount = 0;
    
    // Función global para manejar case studies desde messageManager
    window.handleCaseStudyCheck = function(aiContent, currentMessages) {
      // 🚨 CRITICAL VALIDATION: Only allow 1 case study total
      if (shownCaseStudies.length > 0) {
        return; // EXIT immediately - NO MORE CASE STUDIES
      }
      
      
      // Crear historial de conversación
      const conversationHistory = currentMessages
        .filter(msg => msg.type !== 'typing' && msg.content)
        .map(msg => msg.content);
      
      // Verificar si debemos mostrar case studies
      const caseStudyDetection = shouldShowCaseStudies(aiContent, messageCount, conversationHistory);
      
      if (caseStudyDetection.shouldShow) {
        
        // NUEVA LÓGICA SIMPLIFICADA: Extraer case study del JSON del AI
        let selectedCaseStudies = [];
        
        
        // Intentar extraer caseStudyToShow del JSON
        const aiSpecifiedCaseStudy = extractCaseStudyFromAIResponse(aiContent);
        
        if (aiSpecifiedCaseStudy && !shownCaseStudies.includes(aiSpecifiedCaseStudy)) {
          // AI especificó un case study válido
          if (caseStudiesDB[aiSpecifiedCaseStudy]) {
            selectedCaseStudies = [caseStudiesDB[aiSpecifiedCaseStudy]];
          } else {
            console.error('❌ AI specified invalid case study ID:', aiSpecifiedCaseStudy);
          }
        } else if (aiSpecifiedCaseStudy && shownCaseStudies.includes(aiSpecifiedCaseStudy)) {
        }
        
        // FALLBACK: Solo si AI no especificó o especificó uno inválido
        if (selectedCaseStudies.length === 0) {
          
          const mentionedCaseStudy = detectMentionedCaseStudy(aiContent);
          
          if (mentionedCaseStudy && !shownCaseStudies.includes(mentionedCaseStudy.id)) {
            selectedCaseStudies = [mentionedCaseStudy];
          } else {
            const userContext = extractUserContext(conversationHistory);
            selectedCaseStudies = selectRelevantCaseStudies(
              userContext,
              userContext.projectType,
              userContext.industry,
              messageCount, 
              shownCaseStudies,
              aiContent
            );
          }
        }
        
        // Crear mensaje de case study si hay alguno seleccionado
        if (selectedCaseStudies && selectedCaseStudies.length > 0) {
          // CRITICAL VALIDATION: Verificar que el case study seleccionado existe en caseStudiesDB
          const validatedCaseStudies = selectedCaseStudies.filter(study => {
            if (!study || !study.id) {
              console.error('❌ INVALID case study object:', study);
              return false;
            }
            if (!caseStudiesDB[study.id]) {
              console.error('❌ Case study ID not found in caseStudiesDB:', study.id);
              console.error('Available IDs:', Object.keys(caseStudiesDB));
              return false;
            }
            return true;
          });
          
          if (validatedCaseStudies.length !== selectedCaseStudies.length) {
            console.error('🚨 MISMATCH: Some selected case studies are invalid!');
          }
          
          
          // Usar solo los case studies validados
          selectedCaseStudies = validatedCaseStudies;
          
          // Marcar como mostrados
          selectedCaseStudies.forEach(study => {
            if (!shownCaseStudies.includes(study.id)) {
              shownCaseStudies.push(study.id);
            }
          });
          
          // Crear mensaje separado con case studies
          const caseStudyMessage = {
            id: 'case-study-' + Date.now(),
            type: 'ai',
            content: createMultipleCaseStudyCards(selectedCaseStudies),
            timestamp: new Date().toLocaleTimeString(),
            isCaseStudy: true // Marcar como mensaje de case study
          };
          
          // CRITICAL VALIDATION: Verificar que lo que dice el AI coincida con lo que se muestra
          const aiContentLower = aiContent.toLowerCase();
          const mentionedInAI = selectedCaseStudies.every(study => {
            const studyName = study.title.toLowerCase();
            const studyId = study.id.toLowerCase();
            
            // Verificar diferentes variaciones del nombre
            const possibleMentions = [
              studyName,
              studyId,
              study.title.split(' - ')[0].toLowerCase(), // Primera parte del título
              study.title.split(' ')[0].toLowerCase()    // Primera palabra
            ];
            
            const mentioned = possibleMentions.some(mention => aiContentLower.includes(mention));
            
            if (!mentioned) {
              console.error('🚨 CRITICAL MISMATCH:', {
                aiSaid: aiContentLower.substring(0, 200) + '...',
                cardShowing: study.title,
                studyId: study.id,
                possibleMentions
              });
            }
            
            return mentioned;
          });
          
          if (!mentionedInAI && selectedCaseStudies.length > 0) {
            console.error('🚨 MAJOR PROBLEM: AI text does not mention the case study being displayed!');
            console.error('This breaks the user experience - AI says one thing, UI shows another');
          } else {
          }
          
          // Agregar mensaje de case study después de un breve delay
          setTimeout(() => {
            messageManager.addMessage(caseStudyMessage);
          }, 500);
        } else {
        }
      } else {
      }
    };
    
    function init() {
      urlManager.onChange((value) => {
        isModalOpen = value === 'open';
        updateModal();
      });
      
      messageManager.onChange((messages) => {
        // Increment counter when new AI messages arrive
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.type === 'ai' && !lastMessage.content.includes('typing')) {
          messageCount++;
        }
        renderMessages(messages);
      });
      
      render();
      createTaskDropdown();
      
      const initialValue = urlManager.getValue();
      isModalOpen = initialValue === 'open';
      updateModal();
      
      renderMessages(messageManager.getMessages());
      
    }
    
    function createTaskDropdown() {
      // Remove existing dropdown if any
      const existingDropdown = document.getElementById('taskDropdown');
      if (existingDropdown) {
        existingDropdown.remove();
      }
      
      // Create full-screen overlay dropdown
      const dropdown = document.createElement('div');
      dropdown.id = 'taskDropdown';
      dropdown.className = 'chat-ia__task-overlay';
      dropdown.innerHTML = `
        <div class="chat-ia__task-overlay-backdrop"></div>
        <div class="chat-ia__task-modal">
          <div class="chat-ia__task-header">
            <h3 style="position: relative; top: 2px;">Select Task Type</h3>
            <button type="button" class="chat-ia__task-close" id="taskCloseBtn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="chat-ia__task-list">
            <div class="chat-ia__task-option" data-value="shopify-migration">
              <div class="chat-ia__task-icon">🛒</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Shopify Migration</div>
                <div class="chat-ia__task-description">Move your store to Shopify platform</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="custom-development">
              <div class="chat-ia__task-icon">⚡</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Custom Development</div>
                <div class="chat-ia__task-description">Build custom features and functionality</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="theme-customization">
              <div class="chat-ia__task-icon">🎨</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Theme Customization</div>
                <div class="chat-ia__task-description">Customize your store's design and layout</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="app-integration">
              <div class="chat-ia__task-icon">🔗</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">App Integration</div>
                <div class="chat-ia__task-description">Connect and integrate third-party apps</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="performance-optimization">
              <div class="chat-ia__task-icon">🚀</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Performance Optimization</div>
                <div class="chat-ia__task-description">Improve your store's speed and performance</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="consultation">
              <div class="chat-ia__task-icon">💡</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Consultation</div>
                <div class="chat-ia__task-description">Get expert advice and recommendations</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="maintenance">
              <div class="chat-ia__task-icon">🔧</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Maintenance & Support</div>
                <div class="chat-ia__task-description">Ongoing maintenance and technical support</div>
              </div>
            </div>
            <div class="chat-ia__task-option" data-value="other">
              <div class="chat-ia__task-icon">❓</div>
              <div class="chat-ia__task-content">
                <div class="chat-ia__task-title">Other</div>
                <div class="chat-ia__task-description">Something else? Let us know what you need</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add to body
      document.body.appendChild(dropdown);
      
      // Add event listeners
      dropdown.querySelector('.chat-ia__task-list').addEventListener('click', handleTaskSelection);
      dropdown.querySelector('.chat-ia__task-close').addEventListener('click', closeTaskDropdown);
      dropdown.querySelector('.chat-ia__task-overlay-backdrop').addEventListener('click', closeTaskDropdown);
    }
    
    function render() {
      container.innerHTML = `
        <!-- <div class="chat-ia__trigger">
          <button class="chat-ia__open-button" id="openChatButton">
            💬 Open Chat
          </button>
        </div> -->
        
        <div class="chat-ia__modal" id="chatModal">
          <div class="chat-ia__overlay" id="modalOverlay"></div>
          <div class="chat-ia__window">
            <div class="chat-ia__header">
              <h3>Chat with Milo</h3>
              <button type="button" class="chat-ia__close-button" id="chatCloseBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div class="chat-ia__messages" id="messagesContainer"></div>
            
            <!-- 🎯 FREE AUDIT BUTTON - Shown after email capture -->
            <div class="chat-ia__free-audit-container" id="freeAuditContainer" style="display: none;">
              <a 
                href="https://arcticgrey.com/pages/free-audit-form" 
                target="_blank" 
                rel="noopener noreferrer"
                class="chat-ia__free-audit-button"
                id="freeAuditButton"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                <span>Get Your <span class="chat-ia__gradient-text">Free</span> Audit</span>
                <svg class="chat-ia__external-link-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
            </div>
            
            <div class="chat-ia__input-area">
              <div class="chat-ia__input-container">
                <div class="chat-ia__input-box">
                  <textarea 
                    class="chat-ia__text-input" 
                    placeholder="Ask anything..."
                    id="messageInput"
                    autocomplete="off"
                    rows="1"
                  ></textarea>
                </div>
                
                <div class="chat-ia__action-bar">
                  <div class="chat-ia__left-actions">
                    <button type="button" class="chat-ia__upload-button" id="uploadButton">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
                    </button>
                    <input type="file" id="pdfFileInput" accept=".pdf" style="display: none;" multiple>
                    
                    <div class="chat-ia__task-dropdown">
                      <button type="button" class="chat-ia__task-button" id="taskButton">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>Select Task Type</span>
                      </button>
                    </div>
                  </div>
                  
                  <div class="chat-ia__right-icons">
                    <button type="button" class="chat-ia__enter-button" id="enterButton">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 🔒 EMAIL CAPTURE OVERLAY - Shown after 3 messages without email -->
            <div class="chat-ia__email-overlay" id="emailCaptureOverlay" style="display: none;">
              <div class="chat-ia__email-capture-card">
                <h3 class="chat-ia__email-capture-title">Enter your email to continue chatting</h3>
                <p class="chat-ia__email-capture-subtitle">To continue our conversation and provide you with better assistance, we need your email address.</p>
                
                <form class="chat-ia__email-capture-form" id="emailCaptureForm">
                  <div class="chat-ia__email-input-wrapper">
                    <input 
                      type="email" 
                      class="chat-ia__email-capture-input" 
                      id="emailCaptureInput"
                      placeholder="your@email.com"
                      required
                      autocomplete="email"
                    />
                  </div>
                  
                  <button type="submit" class="chat-ia__email-capture-button">
                    Continue conversation
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      `;
      
      bindEvents();
    }
    
    function bindEvents() {
      const openButton = document.getElementById('openChatButton');
      if (openButton) {
        openButton.addEventListener('click', openModal);
      }
      
      const overlay = document.getElementById('modalOverlay');
      if (overlay) {
        overlay.addEventListener('click', () => closeModal('click_outside'));
      }
      
      const chatCloseBtn = document.getElementById('chatCloseBtn');
      if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', () => closeModal('close_button'));
      }
      
      const enterButton = document.getElementById('enterButton');
      if (enterButton) {
        enterButton.addEventListener('click', handleSubmit);
      }
      
      const messageInput = document.getElementById('messageInput');
      if (messageInput) {
        messageInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        });
      }
      
      const taskButton = document.getElementById('taskButton');
      if (taskButton) {
        taskButton.addEventListener('click', toggleTaskDropdown);
      }
      
      const uploadButton = document.getElementById('uploadButton');
      const pdfFileInput = document.getElementById('pdfFileInput');
      if (uploadButton && pdfFileInput) {
        uploadButton.addEventListener('click', () => {
          pdfFileInput.click();
        });
        
        pdfFileInput.addEventListener('change', (event) => {
          messageManager.handleFileUpload(event);
        });
      }
      
      
      // Task dropdown is created separately and added to body
      
      // Close dropdown when clicking outside (not needed for overlay, but keep for ESC key)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeTaskDropdown();
        }
      });
      
      // Close dropdown on window resize
      window.addEventListener('resize', () => {
        closeTaskDropdown();
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isModalOpen) {
          closeModal('escape_key');
        }
      });
      
      // 🔒 EMAIL CAPTURE OVERLAY - Event listeners
      const emailCaptureForm = document.getElementById('emailCaptureForm');
      if (emailCaptureForm) {
        emailCaptureForm.addEventListener('submit', (e) => {
          e.preventDefault();
          handleEmailCapture();
        });
      }

      // EMERGENCY EMAIL CAPTURE REMOVED - No longer automatically triggered
      // Emergency emails will only be sent when user explicitly closes chat AND has provided email
    }
    
    function openModal() {
      urlManager.setValue('open');
    }
    
    function closeModal(reason = 'manual_close') {
      
      // 📧 EMAIL FALLBACK - Only send when user closes chat AND has provided email
      if (reason === 'click_outside' || reason === 'escape_key' || reason === 'close_button') {
        // Check if user has provided an email in the conversation
        const hasEmail = checkForEmailInConversation();
        
        if (hasEmail && messageManager && typeof messageManager.sendEmailFallback === 'function') {
          messageManager.sendEmailFallback(reason).catch(error => {
          });
        }
      }
      
      closeTaskDropdown(); // Close dropdown when modal closes
      urlManager.setValue(null);
    }
    
    // Helper function to check if user has provided an email in conversation
    function checkForEmailInConversation() {
      const messages = messageManager.getMessages();
      const allMessages = messages.map(m => m.content).join(' ');
      const emailMatch = allMessages.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      return emailMatch && emailMatch[1] && emailMatch[1].includes('@');
    }
    
    function updateModal() {
      const modal = document.getElementById('chatModal');
      if (!modal) {
        console.error('❌ Modal element not found');
        return;
      }
      
      
      if (isModalOpen) {
        modal.classList.add('chat-ia__modal--open');
        document.body.classList.add('chat-ia-modal-open');
      } else {
        modal.classList.remove('chat-ia__modal--open');
        document.body.classList.remove('chat-ia-modal-open');
      }
    }
    
    function handleSubmit() {
      const input = document.getElementById('messageInput');
      if (!input) return;
      
      const message = input.value.trim();
      
      if (message) {
        messageManager.sendMessage(message);
        input.value = '';
      }
    }
    
    function toggleTaskDropdown() {
      const dropdown = document.getElementById('taskDropdown');
      if (!dropdown) return;
      
      const isOpen = dropdown.classList.contains('chat-ia__task-overlay--open');
      
      if (isOpen) {
        dropdown.classList.remove('chat-ia__task-overlay--open');
      } else {
        dropdown.classList.add('chat-ia__task-overlay--open');
      }
    }
    
    function closeTaskDropdown() {
      const dropdown = document.getElementById('taskDropdown');
      if (!dropdown) return;
      
      dropdown.classList.remove('chat-ia__task-overlay--open');
    }
    
    // 🔒 EMAIL CAPTURE OVERLAY FUNCTIONS
    function showEmailCaptureOverlay() {
      const overlay = document.getElementById('emailCaptureOverlay');
      const messageInput = document.getElementById('messageInput');
      const enterButton = document.getElementById('enterButton');
      
      if (overlay) {
        overlay.style.display = 'flex';
        
        // Disable chat input
        if (messageInput) {
          messageInput.disabled = true;
          messageInput.placeholder = 'Enter your email to continue...';
          messageInput.blur(); // ⭐ Quitar focus del chat input
        }
        if (enterButton) {
          enterButton.disabled = true;
        }
        
        // Focus en el input de email
        setTimeout(() => {
          const emailInput = document.getElementById('emailCaptureInput');
          if (emailInput) {
            emailInput.focus();
            console.log('📧 Focus moved to email input');
          }
        }, 300);
      }
    }
    
    function hideEmailCaptureOverlay() {
      const overlay = document.getElementById('emailCaptureOverlay');
      const messageInput = document.getElementById('messageInput');
      const enterButton = document.getElementById('enterButton');
      
      if (overlay) {
        overlay.style.display = 'none';
        
        // Re-enable chat input
        if (messageInput) {
          messageInput.disabled = false;
          messageInput.placeholder = 'Ask anything...';
          messageInput.focus();
        }
        if (enterButton) {
          enterButton.disabled = false;
        }
      }
    }
    
    function handleEmailCapture() {
      const emailInput = document.getElementById('emailCaptureInput');
      if (!emailInput) return;
      
      const email = emailInput.value.trim();
      
      // Validar email
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        Toast.error('Please enter a valid email address', 3000);
        return;
      }
      
      // Unlock chat con el email
      messageManager.unlockChatWithEmail(email);
      
      // Limpiar input
      emailInput.value = '';
      
      // Mostrar toast de éxito
      Toast.success('Thank you! Let\'s continue our conversation', 3000);
    }
    
    // 🎯 FREE AUDIT BUTTON FUNCTIONS
    function showFreeAuditButton() {
      const container = document.getElementById('freeAuditContainer');
      if (container) {
        container.style.display = 'block';
        
        // Scroll to bottom para mostrar el botón
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
          setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }, 100);
        }
        
        // Mostrar toast informativo
        Toast.info('📋 Get your free Shopify audit now!', 4000);
      }
    }
    
    function hideFreeAuditButton() {
      const container = document.getElementById('freeAuditContainer');
      if (container) {
        container.style.display = 'none';
      }
    }
    
    // 🚫 INPUT CONTROL FUNCTIONS - Disable/Enable while AI is typing
    function disableInput() {
      const messageInput = document.getElementById('messageInput');
      const enterButton = document.getElementById('enterButton');
      
      if (messageInput) {
        messageInput.disabled = true;
        messageInput.placeholder = 'Milo is typing...';
        messageInput.style.opacity = '0.6';
        messageInput.style.cursor = 'not-allowed';
      }
      
      if (enterButton) {
        enterButton.disabled = true;
        enterButton.style.opacity = '0.5';
        enterButton.style.cursor = 'not-allowed';
      }
    }
    
    function enableInput() {
      const messageInput = document.getElementById('messageInput');
      const enterButton = document.getElementById('enterButton');
      const emailOverlay = document.getElementById('emailCaptureOverlay');
      
      // ⭐ NO desbloquear si el modal de email está activo
      if (emailOverlay && emailOverlay.style.display === 'flex') {
        console.log('📧 Email modal is active - keeping input blocked');
        return;
      }
      
      if (messageInput && !messageInput.disabled) return; // Ya está habilitado
      
      if (messageInput) {
        messageInput.disabled = false;
        messageInput.placeholder = 'Ask anything...';
        messageInput.style.opacity = '1';
        messageInput.style.cursor = 'text';
        messageInput.focus(); // Auto-focus después de que el bot termine
      }
      
      if (enterButton) {
        enterButton.disabled = false;
        enterButton.style.opacity = '1';
        enterButton.style.cursor = 'pointer';
      }
    }
    
    // Exponer funciones globalmente para messageManager
    window.showEmailOverlay = showEmailCaptureOverlay;
    window.hideEmailOverlay = hideEmailCaptureOverlay;
    window.showFreeAuditButton = showFreeAuditButton;
    window.hideFreeAuditButton = hideFreeAuditButton;
    window.disableInput = disableInput;
    window.enableInput = enableInput;
    
    function handleTaskSelection(e) {
      const item = e.target.closest('.chat-ia__task-option');
      if (!item) return;
      
      const selectedValue = item.dataset.value;
      const selectedTitle = item.querySelector('.chat-ia__task-title').textContent;
      
      if (!selectedValue) return;
      
      const message = `I'm interested in ${selectedTitle}. Can you help me with this?`;
      
      // Enviar mensaje con task type data
      messageManager.sendMessageWithTaskType(message, {
        taskType: selectedValue,
        taskTitle: selectedTitle
      });
      closeTaskDropdown();
    }
    
    // Track rendered messages to avoid re-rendering
    let lastRenderedMessageCount = 0;
    
    function renderMessages(messages) {
      const container = document.getElementById('messagesContainer');
      if (!container) return;
      
      // Extract conversation history for case study detection
      const conversationHistory = messages
        .filter(msg => msg.type !== 'typing' && msg.content)
        .map(msg => msg.content);
      
      // Filter out empty messages BEFORE rendering
      const validMessages = messages.filter(msg => {
        if (!msg.content) return false;
        if (typeof msg.content === 'string' && msg.content.trim() === '') return false;
        return true;
      });
      
      // OPTIMIZACIÓN: Solo renderizar mensajes nuevos si ya hay mensajes renderizados
      const newMessagesCount = validMessages.length - lastRenderedMessageCount;
      
      if (newMessagesCount > 0 && lastRenderedMessageCount > 0) {
        // Solo agregar los mensajes nuevos
        const newMessages = validMessages.slice(lastRenderedMessageCount);
        const newMessagesHTML = newMessages.map(message => {
        // Skip empty messages - NUNCA renderizar burbujas vacías
        if (!message.content || (typeof message.content === 'string' && message.content.trim() === '')) {
          console.warn('⚠️ Skipping empty message in render:', message);
          return '';
        }
        
        if (message.type === 'typing') {
          return `
            <div class="chat-ia__message chat-ia__message--ai chat-ia__message--typing">
              <div class="chat-ia__message-content">
                <div class="chat-ia__typing-indicator">
                  <div class="chat-ia__typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="chat-ia__typing-text">Milo is typing...</span>
                </div>
              </div>
              <div class="chat-ia__message-timestamp">
                ${message.timestamp}
              </div>
            </div>
          `;
        }
        
        // Add special styling for chunked messages
        const messageClasses = [
          'chat-ia__message',
          `chat-ia__message--${message.type}`,
          message.isChunk ? 'chat-ia__message--chunk' : '',
          message.isCaseStudy ? 'chat-ia__message--case-study' : ''
        ].filter(Boolean).join(' ');
        
        // Only show timestamp on the last chunk or non-chunked messages
        const showTimestamp = !message.isChunk || (message.chunkIndex === message.totalChunks - 1);
        
        // Format content and check if it's empty after formatting
        let formattedContent;
        if (message.isCaseStudy) {
          formattedContent = message.content;
        } else {
          formattedContent = formatMessageContent(message.content);
          
          // IMPORTANTE: Si es mensaje de USUARIO, remover el span del gradiente de email
          if (message.type === 'user') {
            formattedContent = formattedContent.replace(
              /<span class="chat-ia__email-gradient">(.*?)<\/span>/g,
              '$1'
            );
          }
        }
        
        // If formatted content is empty, skip this message
        if (!formattedContent || formattedContent.trim() === '') {
          console.warn('⚠️ Formatted content is empty, skipping message');
          return '';
        }
        
        return `
          <div class="${messageClasses}" data-chunk-index="${message.chunkIndex || 0}" data-total-chunks="${message.totalChunks || 1}">
            <div class="chat-ia__message-content">
              ${formattedContent}
            </div>
            ${showTimestamp ? `
              <div class="chat-ia__message-timestamp">
                ${message.timestamp}
              </div>
            ` : ''}
          </div>
        `;
        }).filter(html => html && html.trim() !== '').join('');
        
        // Agregar solo los nuevos mensajes al contenedor (append, no replace)
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newMessagesHTML;
        while (tempDiv.firstChild) {
          container.appendChild(tempDiv.firstChild);
        }
        
        lastRenderedMessageCount = validMessages.length;
      } else {
        // Primera renderización o re-render completo
        container.innerHTML = validMessages.map(message => {
          // Skip empty messages - NUNCA renderizar burbujas vacías
          if (!message.content || (typeof message.content === 'string' && message.content.trim() === '')) {
            console.warn('⚠️ Skipping empty message in render:', message);
            return '';
          }
          
          if (message.type === 'typing') {
            return `
              <div class="chat-ia__message chat-ia__message--ai chat-ia__message--typing">
                <div class="chat-ia__message-content">
                  <div class="chat-ia__typing-indicator">
                    <div class="chat-ia__typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span class="chat-ia__typing-text">Milo is typing...</span>
                  </div>
                </div>
                <div class="chat-ia__message-timestamp">
                  ${message.timestamp}
                </div>
              </div>
            `;
          }
          
          // Add special styling for chunked messages
          const messageClasses = [
            'chat-ia__message',
            `chat-ia__message--${message.type}`,
            message.isChunk ? 'chat-ia__message--chunk' : '',
            message.isCaseStudy ? 'chat-ia__message--case-study' : ''
          ].filter(Boolean).join(' ');
          
          // Only show timestamp on the last chunk or non-chunked messages
          const showTimestamp = !message.isChunk || (message.chunkIndex === message.totalChunks - 1);
          
          // Format content and check if it's empty after formatting
          let formattedContent;
          if (message.isCaseStudy) {
            formattedContent = message.content;
          } else {
            formattedContent = formatMessageContent(message.content);
            
            // IMPORTANTE: Si es mensaje de USUARIO, remover el span del gradiente de email
            if (message.type === 'user') {
              formattedContent = formattedContent.replace(
                /<span class="chat-ia__email-gradient">(.*?)<\/span>/g,
                '$1'
              );
            }
          }
          
          // If formatted content is empty, skip this message
          if (!formattedContent || formattedContent.trim() === '') {
            console.warn('⚠️ Formatted content is empty, skipping message');
            return '';
          }
          
          return `
            <div class="${messageClasses}" data-chunk-index="${message.chunkIndex || 0}" data-total-chunks="${message.totalChunks || 1}">
              <div class="chat-ia__message-content">
                ${formattedContent}
              </div>
              ${showTimestamp ? `
                <div class="chat-ia__message-timestamp">
                  ${message.timestamp}
                </div>
              ` : ''}
            </div>
          `;
        }).filter(html => html && html.trim() !== '').join('');
        
        lastRenderedMessageCount = validMessages.length;
      }
      
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
      
      // Add click listeners to case study cards
      container.querySelectorAll('.chat-ia__case-study-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // If they didn't click the button, make the card clickable too
          if (!e.target.closest('.chat-ia__case-study-button')) {
            const url = card.querySelector('.chat-ia__case-study-button').href;
            window.open(url, '_blank');
          }
        });
      });

      // Add click listeners to Jake cards
      container.querySelectorAll('.chat-ia__jake-card').forEach(card => {
        card.addEventListener('click', (e) => {
          // If they didn't click the button, make the card clickable too
          if (!e.target.closest('.chat-ia__case-study-button')) {
            const url = card.querySelector('.chat-ia__case-study-button').href;
            window.open(url, '_blank');
          }
        });
      });
    }
    
    // Cleanup function
    function cleanup() {
      const dropdown = document.getElementById('taskDropdown');
      if (dropdown) {
        dropdown.remove();
      }
    }
    
    // Inicializar
    init();
    
    return {
      openModal,
      closeModal,
      handleSubmit,
      renderMessages,
      cleanup
    };
  }
  
  // ===== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN =====
  
  function initializeChatIA() {
    
    document.querySelectorAll('[data-chat-ia-widget]:not([data-initialized])').forEach((widget) => {
      try {
        const mountTarget = widget.querySelector('.react-mount-target');
        if (!mountTarget) {
          console.error('❌ Mount target not found for Chat IA widget');
          return;
        }
        
        const loadingFallback = widget.querySelector('.react-loading-fallback');
        if (loadingFallback) {
          loadingFallback.remove();
        }
        
        createChatInterface(mountTarget);
        widget.setAttribute('data-initialized', 'true');
        
        
      } catch (error) {
        console.error('❌ Chat IA widget failed to initialize:', error);
      }
    });
  }
  
  // ===== FUNCIÓN PARA TRIGGER EXTERNO =====
  
  function openChatFromURL() {
    const url = new URL(window.location.href);
    url.searchParams.set('chatAi', 'open');
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  }
  
  // ===== INICIALIZACIÓN SEGURA =====
  
  function safeInitialization() {
    try {
      initializeChatIA();
    } catch (error) {
      console.error('❌ Chat IA safe initialization failed:', error);
    }
  }
  
  // Export para uso global
  window.initializeChatIA = initializeChatIA;
  window.openChatFromURL = openChatFromURL;
  
  // 🚨 Export toast system for emergency capture notifications
  window.chatToastSystem = Toast;
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInitialization);
  } else {
    safeInitialization();
  }
  
  // Manejar recargas del editor de temas de Shopify
  document.addEventListener('shopify:section:load', safeInitialization);
  
})();

