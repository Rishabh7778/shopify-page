/**
 * Quote IA - Simplified Version with File Upload and Country
 */

const quoteInstances = new Map();
let currentInstance = null;

//get shop
const shop = window.location.hostname;

/**
 * Create modal dynamically
 */
function createModal() {
  let modal = document.getElementById("quote-modal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quote-modal";
    modal.className = "quote-modal";
    modal.style.display = "none";

    modal.innerHTML = `
      <div class="quote-modal-content">
        <div class="quote-modal-header">
          <h3>Complete Your Quote Request</h3>
          <button type="button" class="quote-modal-close" onclick="closeModal()">&times;</button>
        </div>
        
        <form id="quote-form" class="quote-modal-form">
          <div class="form-group">
            <label for="user-name">Full Name *</label>
            <input type="text" id="user-name" name="userName" required placeholder="Enter your full name">
          </div>
          
          <div class="form-group">
            <label for="user-email">Email Address *</label>
            <input type="email" id="user-email" name="userEmail" required placeholder="Enter your email address">
          </div>
          
          <div class="form-group">
            <label for="user-country">Country *</label>
            <input type="text" id="user-country" name="userCountry" required placeholder="Enter your country">
          </div>
          
          <div class="form-actions">
            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn-primary" id="submit-quote">Send Quote Request</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    bindModalEvents(modal);
  }

  return modal;
}

/**
 * Bind modal events
 */
function bindModalEvents(modal) {
  const form = modal.querySelector("#quote-form");
  if (form) {
    // Remover event listeners existentes para evitar duplicados
    form.removeEventListener("submit", handleFormSubmit);
    form.addEventListener("submit", handleFormSubmit);
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * Handle form submit - PREVIENE HARD RELOAD
 */
function handleFormSubmit(e) {
  e.preventDefault(); // PREVIENE HARD RELOAD
  e.stopPropagation(); // DETIENE PROPAGACIÓN
  e.stopImmediatePropagation(); // DETIENE TODOS LOS EVENTOS
  submitQuote();
  return false; // ASEGURA QUE NO SE PROCESE MÁS
}

/**
 * Adjust select width based on selected text
 */
function adjustSelectWidth(selectElement) {
  // Create a temporary span to measure text width
  const tempSpan = document.createElement('span');
  tempSpan.style.cssText = `
    position: absolute;
    visibility: hidden;
    height: 0;
    font-family: Poppins;
    font-weight: 500;
    font-size: 14px;
    white-space: nowrap;
  `;
  
  // Get the selected text
  const selectedText = selectElement.options[selectElement.selectedIndex]?.text || "Shopify Task";
  tempSpan.textContent = selectedText;
  
  // Add to DOM temporarily to measure
  document.body.appendChild(tempSpan);
  
  // Get the measured width
  const textWidth = tempSpan.offsetWidth;
  
  // Remove temporary element
  document.body.removeChild(tempSpan);
  
  // Calculate the new width (text width + padding + icon space)
  const iconWidth = 20; // Calendar icon width
  const gap = 4; // Gap between icon and text
  const padding = 32; // Left and right padding (16px each)
  const minWidth = 157; // Minimum width for placeholder
  
  const newWidth = Math.max(minWidth, textWidth + iconWidth + gap + padding);
  
  // Apply the new width to the wrapper
  const wrapper = selectElement.closest('.quote-ia-dropdown-wrapper');
  if (wrapper) {
    wrapper.style.width = `${newWidth}px`;
  }
  
}

/**
 * Placeholder phrases for typewriter effect
 */
const PLACEHOLDER_PHRASES = [
  "If I want Arctic Grey to connect my Shopify site to Oracle NetSuite ERP, how much will that cost, and what's involved?",
  "I want to add subscription products to my site using ReCharge, Ordergroove, or Awtomic; how much will that cost to build?",
  "I'm looking to improve conversion rates on my website; what would a CRO audit cost?",
  "I'm looking to migrate my site from Magento to Shopify.",
  "If I need Arctic Grey to build a brand new Shopify store from scratch, including custom theme design, what's the cost and process?",
  "I want to optimize my Shopify site's speed to improve Core Web Vitals; how much does the Speed Plus service cost, and what steps are involved?",
  "I'm interested in a UX & UI audit for my entire Shopify site; what would that cost?",
  "If I want to gamify my cart drawer to boost average order value, how much will Arctic Grey charge, and what's the implementation like?",
  "I need to integrate AI product recommendations on my Shopify store; what's the cost and what's required?",
  "I'm looking to migrate from WooCommerce to Shopify for my D2C business; how much would that cost?",
  "If I want Arctic Grey to develop a custom private app for my Shopify store, what's the price and development timeline?",
  "I want to turn my Shopify store into a custom mobile app; how much will that cost to build?",
  "I'm seeking A/B testing services for my marketing pages; what would that involve and cost?",
  "If I need ERP integration with Microsoft Dynamics 365 for my Shopify site, how much does it cost, and what's the process?",
  "I want to set up pre and post-purchase upsells on my store; what's the build cost using Arctic Grey?",
  "I'm looking for a full site audit to identify optimizations; what would that cost?",
  "If I want to connect my Shopify to SAP S/4HANA Cloud ERP, how much will Arctic Grey charge, and what's involved?",
  "I need custom API bridges built for my eCommerce integrations; what's the cost and scope?",
  "I'm interested in retention marketing strategies for my Shopify Plus store; how much does that service cost?",
  "If I want Arctic Grey to handle Google Ads management, what's the pricing and what's included?",
  "I want to add custom forms to my site using their Form Builder app; how much for setup and customization?",
  "I'm looking to migrate my B2B wholesale site to Shopify; what would the cost be?",
  "If I need emergency fixes and general tech support for my Shopify store, how much via Bulk Hours?",
  "I want to improve responsive design on my mobile site; what's the cost for Arctic Grey to handle it?",
  "I'm seeking SEO specialist services to boost my store's visibility; how much does that cost monthly?",
  "If I want to integrate Katana for inventory management with Shopify, what's the integration cost and process?",
  "I need workflow automation set up on my store; how much will that cost to implement?",
  "I'm looking for a free Shopify Concept Design, but then full development; what's the total cost after the free part?",
  "If I want TikTok Ads specialist help integrated with my Shopify, what's the service fee?",
  "I want to deploy complex feature upgrades via GitHub; how much for Arctic Grey's development support?"
];

/**
 * Typewriter effect for typing text element
 */
function startTypewriterEffect(typingElement, progressFill) {
  
  if (!typingElement) {
    console.error('❌ No typing element provided to startTypewriterEffect');
    return;
  }
  
  
  let currentPhraseIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;
  let currentText = '';
  
  function typeNextChar() {
    const currentPhrase = PLACEHOLDER_PHRASES[currentPhraseIndex];
    
    if (isDeleting) {
      // Deleting characters
      currentText = currentPhrase.substring(0, currentCharIndex - 1);
      currentCharIndex--;
    } else {
      // Typing characters
      currentText = currentPhrase.substring(0, currentCharIndex + 1);
      currentCharIndex++;
    }
    
    // Update text content instead of placeholder
    typingElement.textContent = currentText;
    
    // Update progress bar based on typing
    if (progressFill) {
      const charCount = currentText.length;
      const percentage = Math.max(5, Math.min((charCount / 100) * 100, 100));
      progressFill.style.setProperty('width', `${percentage}%`, 'important');
    }
    
    // Debug log every few characters
    if (currentCharIndex % 10 === 0 || currentCharIndex === currentPhrase.length) {
    }
    
    // Determine typing speed
    let typeSpeed = isDeleting ? 25 : 50; // Faster deletion, faster typing
    
    // Add some randomness to make it more natural
    typeSpeed += Math.random() * 20;
    
    if (!isDeleting && currentCharIndex === currentPhrase.length) {
      // Finished typing, wait then start deleting
      typeSpeed = 2000; // Wait 2 seconds
      isDeleting = true;
    } else if (isDeleting && currentCharIndex === 0) {
      // Finished deleting, move to next phrase
      isDeleting = false;
      currentPhraseIndex = (currentPhraseIndex + 1) % PLACEHOLDER_PHRASES.length;
      typeSpeed = 500; // Wait 0.5 seconds before next phrase
    }
    
    setTimeout(typeNextChar, typeSpeed);
  }
  
  // Start the typewriter effect
  typeNextChar();
}

/**
 * Initialize Quote IA (simplified)
 */
function initializeQuoteIA(blockId) {
  
  const container = document.getElementById(`quote-ia-${blockId}`);
  if (!container) {
    console.error(`❌ Container not found: quote-ia-${blockId}`);
    return;
  }

  // Buscar el progress fill de manera más específica
  const progressFill = container.querySelector('.quote-ia-progress .quote-ia-progress-bar .quote-ia-progress-fill');

  // BUSCAR EL INPUT DE MANERA MÁS FLEXIBLE
  let mainInput = container.querySelector(`#main-input-${blockId}`);
  if (!mainInput) {
    // Fallback: buscar por clase si no se encuentra por ID
    mainInput = container.querySelector('.quote-ia-main-input') || container.querySelector('.quote-ia-main-input-simple');
  }

  // Buscar elemento de typing
  const typingElement = container.querySelector(`#typing-text-${blockId}`) || container.querySelector('.quote-ia-typing-text');

  const instance = {
    blockId: blockId,
    uploadedFiles: [],
    apiEndpoint: `/apps/quote-generator-main?shop=${shop}`,
    elements: {
      mainInput: mainInput,
      typingElement: typingElement,
      taskSelect: container.querySelector(`#task-select-${blockId}`),
      quoteBtn: container.querySelector(`#get-quote-${blockId}`),
      responseArea: container.querySelector(`#response-${blockId}`),
      fileInput: container.querySelector(`#image-upload-${blockId}`),
      progressFill: progressFill,
    },
  };



  quoteInstances.set(blockId, instance);

  // Progress bar update function
  function updateProgressBar() {
    if (instance.elements.mainInput && instance.elements.progressFill) {
      const charCount = instance.elements.mainInput.value ? instance.elements.mainInput.value.length : 0;
      const percentage = Math.max(5, Math.min((charCount / 100) * 100, 100));
      instance.elements.progressFill.style.setProperty('width', `${percentage}%`, 'important');
    }
  }

  // AGREGAR EVENTO CLICK AL CONTAINER PARA PARÁMETRO URL
  container.addEventListener("click", () => {
    addChatAiParameter();
  });

  // INICIAR EFECTO TYPEWRITER EN EL ELEMENTO DE TYPING
  if (instance.elements.typingElement) {
    
    // Limpiar texto existente antes de empezar
    instance.elements.typingElement.textContent = '';
    
    startTypewriterEffect(instance.elements.typingElement, instance.elements.progressFill);
  } else {
    console.error(`❌ Typing element not found for block ${blockId}`);
    // Fallback: buscar cualquier elemento de typing en el container
    const fallbackTypingElement = container.querySelector('.quote-ia-typing-text');
    if (fallbackTypingElement) {
      fallbackTypingElement.textContent = '';
      startTypewriterEffect(fallbackTypingElement, instance.elements.progressFill);
    }
  }

  // Bind events - SOLO URL Observer
  if (instance.elements.quoteBtn) {
    instance.elements.quoteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addChatAiParameter();
    });
  }

  // Bind file upload button - SOLO URL Observer
  const fileBtn = container.querySelector('.quote-ia-file-btn');
  if (fileBtn) {
    fileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addChatAiParameter();
    });
  }

  // Bind task selector - SOLO URL Observer  
  const taskSelector = container.querySelector('.quote-ia-task-selector');
  if (taskSelector) {
    taskSelector.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      addChatAiParameter();
    });
  }

  // Bind textarea input event for progress bar
  if (instance.elements.mainInput) {
    instance.elements.mainInput.addEventListener("input", updateProgressBar);
    // Initialize progress bar on load
    updateProgressBar();
  }
}

/**
 * Agregar parámetro chatAi=open a la URL
 */
function addChatAiParameter() {
  const currentUrl = new URL(window.location.href);
  
  // Solo agregar si no existe ya
  if (!currentUrl.searchParams.has('chatAi')) {
    currentUrl.searchParams.set('chatAi', 'open');
    
    // Actualizar URL sin recargar la página
    window.history.pushState({}, '', currentUrl.toString());
    
  }
}

/**
 * Handle file upload
 */
function handleFileUpload(instance, files) {

  const maxFileSize = 100 * 1024 * 1024; // 100MB max
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/octet-stream",
  ];

  Array.from(files).forEach((file, index) => {
    
    // Validate file type
    if (!allowedTypes.includes(file.type)) {
      alert(
        `File type not supported: ${file.name}. Please upload images (JPEG, PNG, GIF, WebP) or PDF files.`,
      );
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      alert(`File too large: ${file.name}. Maximum size is 100MB.`);
      return;
    }

    // Add file to instance
    instance.uploadedFiles.push({
      name: file.name,
      type: file.type,
      size: file.size,
      file: file,
    });

  });

  updateFilesDisplay(instance);
}

/**
 * Update files display
 */
function updateFilesDisplay(instance) {
  const filePreviewArea = document.getElementById(`file-preview-area-${instance.blockId}`);
  if (!filePreviewArea) return;

  filePreviewArea.innerHTML = "";

  if (instance.uploadedFiles.length > 0) {
    filePreviewArea.style.display = "flex";
    
    instance.uploadedFiles.forEach((fileData, index) => {
      const fileTag = document.createElement("span");
      fileTag.className = "quote-ia-file-preview";
      fileTag.innerHTML = `
        ${fileData.name} 
        <button type="button" class="quote-ia-file-remove" onclick="removeFile('${instance.blockId}', ${index})">&times;</button>
      `;
      filePreviewArea.appendChild(fileTag);
    });
  } else {
    filePreviewArea.style.display = "none";
  }
}

/**
 * Remove file
 */
function removeFile(blockId, index) {
  const instance = quoteInstances.get(blockId);
  if (instance) {
    instance.uploadedFiles.splice(index, 1);
    updateFilesDisplay(instance);
  }
}

/**
 * Open modal
 */
function openModal() {
  const query = currentInstance.elements.mainInput?.value.trim();
  const selectedTask = currentInstance.elements.taskSelect?.value;
  
  if (!query) {
    alert("Please describe your project requirements.");
    return;
  }

  if (!selectedTask) {
    alert("Please select a Shopify task.");
    return;
  }

  const modal = createModal();
  modal.style.display = "flex";
  document.getElementById("user-name")?.focus();
}

/**
 * Close modal
 */
function closeModal() {
  const modal = document.getElementById("quote-modal");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("quote-form")?.reset();
    clearErrors();
  }
}

/**
 * Clear form errors
 */
function clearErrors() {
  document
    .querySelectorAll("#user-name, #user-email, #user-country")
    .forEach((input) => {
      input.classList.remove("error");
      input.parentNode?.querySelector(".error-message")?.remove();
    });
}

/**
 * Validate form
 */
function validateForm() {
  let isValid = true;

  const fields = [
    {
      id: "user-name",
      minLength: 2,
      message: "Please enter your full name (minimum 2 characters)",
    },
    {
      id: "user-email",
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    {
      id: "user-country",
      minLength: 2,
      message: "Please enter your country (minimum 2 characters)",
    },
  ];

  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    const value = input?.value.trim();

    if (
      !value ||
      (field.minLength && value.length < field.minLength) ||
      (field.pattern && !field.pattern.test(value))
    ) {
      showError(input, field.message);
      isValid = false;
    } else {
      clearError(input);
    }
  });

  return isValid;
}

/**
 * Show field error
 */
function showError(input, message) {
  if (!input) return;

  input.classList.add("error");
  const errorMsg = document.createElement("div");
  errorMsg.className = "error-message";
  errorMsg.textContent = message;
  input.parentNode?.appendChild(errorMsg);
}

/**
 * Clear field error
 */
function clearError(input) {
  if (!input) return;
  input.classList.remove("error");
  input.parentNode?.querySelector(".error-message")?.remove();
}



/**
 * Submit quote with binary files - SIN HARD RELOAD
 */
async function submitQuote() {
  if (!currentInstance || !validateForm()) return;

  const submitBtn = document.getElementById("submit-quote");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
  }

  try {
    // Crear FormData para enviar archivos binarios
    const formData = new FormData();

    // Agregar datos del formulario
    formData.append(
      "query",
      currentInstance.elements.mainInput?.value.trim() || "",
    );
    
    // Agregar la tarea seleccionada
    const selectedTask = currentInstance.elements.taskSelect?.value || "";
    const selectedTaskText = currentInstance.elements.taskSelect?.options[currentInstance.elements.taskSelect?.selectedIndex]?.text || "";
    formData.append("selectedTask", selectedTask);
    formData.append("selectedTaskText", selectedTaskText);
    formData.append(
      "userName",
      document.getElementById("user-name")?.value.trim() || "",
    );
    formData.append(
      "userEmail",
      document.getElementById("user-email")?.value.trim() || "",
    );
    formData.append(
      "userCountry",
      document.getElementById("user-country")?.value.trim() || "",
    );
    formData.append("timestamp", new Date().toISOString());
    formData.append("source", "shopify_extension");

    // Agregar archivos como binary data
    currentInstance.uploadedFiles.forEach((fileData, index) => {
      formData.append(`file_${index}`, fileData.file, fileData.name);
      formData.append(
        `file_${index}_info`,
        JSON.stringify({
          name: fileData.name,
          type: fileData.type,
          size: fileData.size,
        }),
      );
    });

    // Agregar información total de archivos
    formData.append(
      "totalFiles",
      currentInstance.uploadedFiles.length.toString(),
    );
    formData.append(
      "filesInfo",
      JSON.stringify(
        currentInstance.uploadedFiles.map((f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
      ),
    );


    const response = await fetch(currentInstance.apiEndpoint, {
      method: "POST",
      body: formData, 
    });

    if (response.ok) {
      closeModal(); // CERRAR MODAL
      showResponse(
        currentInstance,
        "success",
        "Quote request sent successfully! Our team will contact you soon.",
      );

      // Clear form and files
      if (currentInstance.elements.mainInput) {
        currentInstance.elements.mainInput.value = "";
      }
      if (currentInstance.elements.taskSelect) {
        currentInstance.elements.taskSelect.value = "";
        // Reset select width to default
        adjustSelectWidth(currentInstance.elements.taskSelect);
      }
      currentInstance.uploadedFiles = [];
      updateFilesDisplay(currentInstance);
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Error sending files:", error);
    showResponse(
      currentInstance,
      "error",
      "Failed to send quote request. Please try again.",
    );
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Quote Request";
    }
  }
}

/**
 * Show response message
 */
function showResponse(instance, type, message) {
  const { responseArea } = instance.elements;
  const color = type === "success" ? "#4CAF50" : "#ff6b6b";
  const title = type === "success" ? "Success!" : "Error";

  responseArea.innerHTML = `
    <h4 style="margin: 0 0 0.5rem 0; color: ${color};">${title}</h4>
    <p style="margin: 0; color: #cccccc;">${message}</p>
  `;
  responseArea.style.display = "block";
}

/**
 * Initialize all instances
 */
function initializeAll() {
  
  // Buscar todos los contenedores
  const containers = document.querySelectorAll('[id^="quote-ia-"]');
  
  containers.forEach((container) => {
    const blockId = container.id.replace("quote-ia-", "");
    initializeQuoteIA(blockId);
  });

  // FALLBACK: Si no hay contenedores específicos, buscar elementos de typing directamente
  if (containers.length === 0) {
    const typingElements = document.querySelectorAll('.quote-ia-typing-text');
    
    typingElements.forEach((element, index) => {
      element.textContent = '';
      
      // Buscar progress bar correspondiente
      const progressFill = element.closest('.quote-ia-form-container')?.querySelector('.quote-ia-progress-fill');
      startTypewriterEffect(element, progressFill);
    });
  }

  // Bind events for existing modal (si existe en HTML)
  const existingModal = document.getElementById("quote-modal");
  if (existingModal) {
    bindModalEvents(existingModal);
  }

  // Global events
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// Start when ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAll);
} else {
  initializeAll();
}
