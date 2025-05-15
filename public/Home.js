let qrColor = "#000000";
let bgColor = "#ffffff";
let gradientColor1 = "#000000";
let gradientColor2 = "#000000";
let eyeColor = "#000000";
let eyeballColor = "#000000";

// Check session and show/hide user section
fetch('/session')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      document.getElementById('save-btn').style.display = 'inline-block';
      document.getElementById('user-section').style.display = 'block';
      loadUserConfigs(data.user.id);
    } else {
      // If not logged in, hide everything and optionally redirect
      document.getElementById('save-btn').style.display = 'none';
      document.getElementById('user-section').style.display = 'none';
    }
  })
  .catch(err => console.error('Session check failed:', err));

// Create Pickr instances and store them in variables
function createPickr(selector, defaultColor, onSave) {
  const pickr = Pickr.create({
    el: selector,
    theme: "classic",
    default: defaultColor,
    components: {
      preview: true,
      hue: true,
      interaction: {
        input: true,
        save: true
      }
    }
  });

  pickr.on("save", (color) => {
    const hexColor = pickr.getColor().toHEXA().toString(3);
    onSave(hexColor);
    pickr.hide();
  });

  return pickr;
}

// Save Pickr instances
const qrColorPickr = createPickr("#qr-color-picker", qrColor, (color) => {
  qrColor = color;
});

const bgColorPickr = createPickr("#bg-color-picker", bgColor, (color) => {
  bgColor = color;
});

const gradientColor1Pickr = createPickr("#gradient-color1", gradientColor1, (color) => {
  gradientColor1 = color;
});

const gradientColor2Pickr = createPickr("#gradient-color2", gradientColor2, (color) => {
  gradientColor2 = color;
});

const eyeColorPickr = createPickr("#eye-color", eyeColor, (color) => {
  eyeColor = color;
});

const eyeballColorPickr = createPickr("#eyeball-color", eyeballColor, (color) => {
  eyeballColor = color;
});

// Generate QR code using QRCode Monkey API
document.getElementById("generate-btn").addEventListener("click", async () => {
  const url = document.getElementById("url-input").value || "https://example.com";
  const bodyShape = document.getElementById("body-shape").value;
  const eyeFrame = document.getElementById("eye-frame-shape").value;
  const eyeBall = document.getElementById("eye-ball-shape").value;
  const logo = document.getElementById("url-logo").value;
  const logoMode = document.getElementById("logo-mode").value.toLowerCase();
  const gradientType = document.getElementById("gradient-type").value;

  const config = {
    body: bodyShape,
    eye: eyeFrame,
    eyeBall: eyeBall,
    bodyColor: qrColor,
    bgColor: bgColor,
    eye1Color: eyeColor,
    eye2Color: eyeColor,
    eye3Color: eyeColor,
    eyeBall1Color: eyeballColor,
    eyeBall2Color: eyeballColor,
    eyeBall3Color: eyeballColor,
    gradientOnEyes: false,
    logo: logo,
    logoMode: logoMode
  };

  if (gradientType) {
    config.gradientColor1 = gradientColor1;
    config.gradientColor2 = gradientColor2;
    config.gradientType = gradientType;
    config.colorType = "gradient";
  }

  const payload = {
    data: url,
    config: config,
    size: 300,
    download: false,
    file: "png"
  };

  try {
    const response = await fetch("https://api.qrcode-monkey.com/qr/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const blob = await response.blob();
    document.getElementById("qr-image").src = URL.createObjectURL(blob);
  } catch (err) {
    console.error("QR Code generation failed:", err);
  }
});

// Enhance Select2 dropdowns with images
$(document).ready(function () {
  function formatWithImage(option) {
    if (!option.id) return option.text;
    const imgUrl = $(option.element).data('image');
    if (!imgUrl) return option.text;
    return $(`
      <span style="display: flex; align-items: center;">
        <img src="${imgUrl}" style="width: 30px; height: 30px; object-fit: contain; margin-right: 8px;" />
        ${option.text}
      </span>
    `);
  }

  $('#body-shape, #eye-frame-shape, #eye-ball-shape').select2({
    templateResult: formatWithImage,
    templateSelection: formatWithImage,
    width: '100%'
  });
});

// Save user config on page unload
window.onbeforeunload = function () {
  const selections = {
    url: $('#url-input').val(),
    bodyColor: qrColorPickr.getColor().toHEXA().toString(),
    bgColor: bgColorPickr.getColor().toHEXA().toString(),
    gradientType: $('#gradient-type').val(),
    gradientColor1: gradientColor1Pickr.getColor().toHEXA().toString(),
    gradientColor2: gradientColor2Pickr.getColor().toHEXA().toString(),
    bodyShape: $('#body-shape').val(),
    eyeFrameShape: $('#eye-frame-shape').val(),
    eyeBallShape: $('#eye-ball-shape').val(),
    eyeColor: eyeColorPickr.getColor().toHEXA().toString(),
    eyeballColor: eyeballColorPickr.getColor().toHEXA().toString(),
    logoMode: $('#logo-mode').val(),
    logoURL: $('#url-logo').val()
  };
  localStorage.setItem('qrConfig', JSON.stringify(selections));
};

// Restore user config from localStorage
const saved = localStorage.getItem('qrConfig');
if (saved) {
  const config = JSON.parse(saved);
  $('#url-input').val(config.url);
  $('#gradient-type').val(config.gradientType);
  $('#body-shape').val(config.bodyShape).trigger('change');
  $('#eye-frame-shape').val(config.eyeFrameShape).trigger('change');
  $('#eye-ball-shape').val(config.eyeBallShape).trigger('change');
  $('#logo-mode').val(config.logoMode);
  $('#url-logo').val(config.logoURL);

  // Restore colors
  qrColorPickr.setColor(config.bodyColor);
  bgColorPickr.setColor(config.bgColor);
  gradientColor1Pickr.setColor(config.gradientColor1);
  gradientColor2Pickr.setColor(config.gradientColor2);
  eyeColorPickr.setColor(config.eyeColor);
  eyeballColorPickr.setColor(config.eyeballColor);
}

// Check session and show user section
fetch('/session')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      document.getElementById('save-btn').style.display = 'inline-block';
      document.getElementById('user-section').style.display = 'block';
      loadUserConfigs(data.user.id);
    }
  });

// Save config to Supabase
document.getElementById('save-btn').addEventListener('click', async () => {
  const sessionRes = await fetch('/session');
  const sessionData = await sessionRes.json();
  if (!sessionData.loggedIn) return alert('Please log in.');

  const config = {
    user_id: sessionData.user.id,
    name: prompt("Enter a name for this QR config:") || "Untitled",
    url: $('#url-input').val(),
    body_color: qrColor,
    bg_color: bgColor,
    gradient_type: $('#gradient-type').val(),
    gradient_color1: gradientColor1,
    gradient_color2: gradientColor2,
    body_shape: $('#body-shape').val(),
    eye_frame: $('#eye-frame-shape').val(),
    eye_ball: $('#eye-ball-shape').val(),
    eye_color: eyeColor,
    eyeball_color: eyeballColor,
    logo_mode: $('#logo-mode').val(),
    logo_url: $('#url-logo').val()
  };

  const res = await fetch('/save-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });

  const result = await res.json();
  alert(result.message || result.error);
  loadUserConfigs(sessionData.user.id);
});

// Load configs
async function loadUserConfigs(userId) {
  const res = await fetch(`/configs/${userId}`);
  const configs = await res.json();

  const container = document.getElementById('saved-list');
  container.innerHTML = '';

  if (!Array.isArray(configs)) return;

  configs.forEach(config => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p><strong>${config.name}</strong></p>
      <button onclick='loadConfig(${JSON.stringify(config)})'>Load</button>
      <button onclick='editConfig(${config.id})'>Edit Name</button>
      <button onclick='deleteConfig(${config.id})'>Delete</button>
      <hr>
    `;
    container.appendChild(div);
  });
}


// Load a config into UI
function loadConfig(config) {
  $('#url-input').val(config.url);
  $('#gradient-type').val(config.gradient_type);
  $('#body-shape').val(config.body_shape).trigger('change');
  $('#eye-frame-shape').val(config.eye_frame).trigger('change');
  $('#eye-ball-shape').val(config.eye_ball).trigger('change');
  $('#logo-mode').val(config.logo_mode);
  $('#url-logo').val(config.logo_url);

  // Restore colors
  qrColorPickr.setColor(config.body_color);
  bgColorPickr.setColor(config.bg_color);
  gradientColor1Pickr.setColor(config.gradient_color1);
  gradientColor2Pickr.setColor(config.gradient_color2);
  eyeColorPickr.setColor(config.eye_color);
  eyeballColorPickr.setColor(config.eyeball_color);
}

async function editConfig(configId) {
  const newName = prompt("Enter a new name for this config:");
  if (!newName) return;

  const res = await fetch(`/edit-config/${configId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  });

  const result = await res.json();
  alert(result.message || result.error);

  const sessionRes = await fetch('/session');
  const sessionData = await sessionRes.json();
  if (sessionData.loggedIn) {
    loadUserConfigs(sessionData.user.id);
  }
}

async function deleteConfig(configId) {
  if (!confirm("Are you sure you want to delete this config?")) return;

  const res = await fetch(`/delete-config/${configId}`, {
    method: 'DELETE'
  });

  const result = await res.json();
  alert(result.message || result.error);

  const sessionRes = await fetch('/session');
  const sessionData = await sessionRes.json();
  if (sessionData.loggedIn) {
    loadUserConfigs(sessionData.user.id);
  }
}
