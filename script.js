(() => {
  const link = document.getElementById('whatsapp-link');
  const config = window.INVITATION_CONFIG || {};
  const number = String(config.whatsappNumber || '').replace(/\D/g, '');
  const message = config.whatsappMessage || "Hello! I have a question regarding Shayan and Kavya's wedding invitation.";
  if (number) {
    link.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  } else {
    link.href = `https://wa.me/?text=${encodeURIComponent(message)}`;
    link.title = 'Add the family WhatsApp number in config.js to direct guests to the right contact.';
  }
})();
