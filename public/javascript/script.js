// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()

  document.addEventListener("DOMContentLoaded", () => {
  const cartButtons = document.querySelectorAll(".add-to-cart");

  cartButtons.forEach(button => {
    button.addEventListener("click", async () => {
      const listingId = button.dataset.id;

      try {
        const res = await fetch(`/cart/add/${listingId}`, {
          method: "POST",
          headers: {
            "X-Requested-With": "XMLHttpRequest"
          }
        });

        if (res.ok) {
          const data = await res.json();
          
          // Update cart count in navbar
          const cartBadge = document.getElementById("cart-count");
          if (cartBadge) {
            cartBadge.textContent = data.cartCount;
          }

          alert("✅ Added to cart");
        } else {
          alert("❌ Failed to add to cart");
        }
      } catch (err) {
        console.error("Add to cart error:", err);
        alert("❌ Error adding to cart");
      }
    });
  });
});
