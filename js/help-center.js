function showSection(type) {
  const faqSection = document.getElementById("faq-section");
  const supportSection = document.getElementById("support-section");
  
  if (type === "faq") {
    faqSection.classList.remove("disp-none"); 
    supportSection.classList.add("disp-none");
  } else if (type === "support") {
    faqSection.classList.add("disp-none"); 
    supportSection.classList.remove("disp-none"); 
  }
}



function submitTicket() {
  const subject = document.getElementById('subject').value;
  const message = document.getElementById('message').value;

  console.log(subject,message)

  
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    showMessage('Authentication required. Please log in again.', 'error');
    setTimeout(() => {
      window.location.href = 'sign-in.html';
    }, 1500);
    return;
  }
  
  const ticketData = {
    subject: subject,
    message: message
  };
  
  axios.post(
    `${baseURL}/ticket/v1/add-update-ticket.php`,
    ticketData,
    {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    }
  )
  .then(function(response) {
    console.log("response",response)
    if (response.data.success) {
      showMessage('Ticket submitted successfully. Our team will respond shortly.', 'success');
      clearTicketForm();
    } else {
      showMessage(response.data.message || 'Failed to submit ticket. Please try again.', 'error');
    }
  })
  .catch(function(error) {
    console.error('Error submitting ticket:', error);
    
    if (error.response && error.response.status === 401) {
      showMessage('Your session has expired. Please login again.', 'error');
      localStorage.removeItem('authToken');
      setTimeout(() => {
        window.location.href = 'sign-in.html';
      }, 1500);
    } else {
      showMessage('An error occurred while submitting your ticket.', 'error');
    }
  });
}

function clearTicketForm() {
  document.getElementById('subject').value = '';
  document.getElementById('message').value = '';
}

document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus("sign-in.html");
  
});