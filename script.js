document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("registrationForm");
    const inputs = form.querySelectorAll("input");

    // Added onChange event listener
    inputs.forEach((input) => {
      input.addEventListener("change", function (event) {
        console.log(`Field ${this.id} changed`);
        validateField(this);
      });

      // Added input event listener for live validation as user type each character
      input.addEventListener("input", function (event) {
        validateField(this);
      });
    });

    //Added onSubmit event listener
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      console.log("Form submitted");

      // Validate all fields
      let isValid = true;
      inputs.forEach((input) => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      if (isValid) {
        console.log("Form is valid");
        alert("Registration successful!");
        form.reset();
        // Clear valid/invalid classes
        inputs.forEach((input) => {
          input.classList.remove("is-valid", "is-invalid");
        });
        // Clear password strength indicator
        document.getElementById("passwordStrength").textContent = "";
      } else {
        console.log("Form is invalid");
      }
    });
  });

  //The main validation function for all input fields.
  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = "";

    switch (field.id) {
      case "fullName":
        if (value.length < 5) {
          isValid = false;
          errorMessage = "Name must be at least 5 characters long";
        } else if (!value.includes(" ")) {
          isValid = false;
          errorMessage = "Please enter both first and last name";
        }
        break;

      // -----Simple & basic email validation----- 

      /* case "email":
        if (!value.includes("@") || !value.includes(".")) {
          isValid = false;
          errorMessage = "Please enter a valid email address";
        }
        break; */

      
      // -----Advanced email validation using regex and split method-----

      case "email":
        let emailError = "";
        let isEmailValid = true;

        // Check if there are multiple @ symbols
        const atSymbols = value.split("@").length - 1;
        if (atSymbols > 1) {
          isEmailValid = false;
          emailError = "Email cannot contain more than one @ symbol";
        }
        // Check if basic format is correct (has @ and .)
        else if (!value.includes("@") || !value.includes(".")) {
          isEmailValid = false;
          emailError = "Email must contain @ and . symbols";
        }
        // Check characters before @
        else {
          const beforeAt = value.split("@")[0];
          const afterAt = value.split("@")[1];

          // Check length before @
          if (beforeAt.length < 2) {
            isEmailValid = false;
            emailError = "Email must have at least 2 characters before @";
          }
          // Check if exactly 2 chars before @ are alphanumeric only
          else if (
            beforeAt.length === 2 &&
            !/^[a-zA-Z0-9]{2}$/.test(beforeAt)
          ) {
            isEmailValid = false;
            emailError =
              "If using only 2 characters before @, they must be alphanumeric only";
          }
          // Check if first character is alphanumeric
          else if (!/^[a-zA-Z0-9]/.test(beforeAt)) {
            isEmailValid = false;
            emailError = "Email must start with a letter or number";
          }
          // Check for invalid special characters (allow only ., -, _)
          else if (/[^a-zA-Z0-9._-]/.test(beforeAt)) {
            isEmailValid = false;
            emailError =
              "Email can only contain letters, numbers, and the special characters . - _";
          }
          // Check for at least one letter before @
          else if (!/[a-zA-Z]/.test(beforeAt)) {
            isEmailValid = false;
            emailError = "Email must contain at least one letter before @";
          }

          // Only proceed with domain checks if we have valid content before @
          if (isEmailValid && afterAt) {
            const domainParts = afterAt.split(".");

            // Check domain part (between @ and .)
            if (domainParts.length < 2) {
              isEmailValid = false;
              emailError =
                "Email must have a domain with at least one alphabetical character";
            } else {
              const domainName = domainParts[0];
              const extension = domainParts[domainParts.length - 1];

              // Check for lowercase, numbers, and allowed special characters between @ and .
              if (!/^[a-z0-9._-]+$/.test(domainName)) {
                isEmailValid = false;
                emailError =
                  "Domain name must contain only lowercase letters, numbers, and the special characters . - _";
              }
              // Check for at least one lowercase letter in domain name
              else if (!/[a-z]/.test(domainName)) {
                isEmailValid = false;
                emailError =
                  "Domain name must contain at least one lowercase letter";
              }
              // Check for at least one character between @ and .
              else if (domainName.length < 1) {
                isEmailValid = false;
                emailError = "Domain name must have at least one character";
              }

              // Check for at least 2 lowercase after final ., allowing only ., -, _
              if (!/^[a-z._-]{2,}$/.test(extension)) {
                isEmailValid = false;
                emailError =
                  "Domain extension must have at least 2 lowercase letters and can include . - _";
              }
            }

            // Check for uppercase after the first character
            if (/[A-Z]/.test(value.substring(1))) {
              isEmailValid = false;
              emailError =
                "Email cannot contain uppercase letters except as the first character";
            }

            // Check for invalid special characters in the entire email (allow only ., -, _)
            if (/[^a-zA-Z0-9@._-]/.test(value)) {
              isEmailValid = false;
              emailError =
                "Email can only contain letters, numbers, and the special characters . - _";
            }
          }
        }

        if (!isEmailValid) {
          isValid = false;
          errorMessage = emailError || "Please enter a valid email address";
        }
        break;



      case "password":
        const strength = calcPassStrength(value);
        const name = document
          .getElementById("fullName")
          .value.toLowerCase();
        if (value.length < 8) {
          isValid = false;
          errorMessage = "Password must be at least 8 characters long";
        } else if (value.toLowerCase() === "password") {
          isValid = false;
          errorMessage = 'Password cannot be "password"';
        } else if (
          name &&
          value.toLowerCase().includes(name.toLowerCase())
        ) {
          isValid = false;
          errorMessage = "Password cannot contain your name";
        } else if (strength < 2) {
          isValid = false;
          errorMessage = "Password is too weak";
        }
        updatePassStrength(value);
        break;

      case "confirmPassword":
        const password = document.getElementById("password").value;
        if (value !== password) {
          isValid = false;
          errorMessage = "Passwords do not match";
        }
        break;
    }

    showError(field.id, errorMessage, isValid);
    return isValid;
  }

  // Function to calculate calculate strength based on user input a lowercase, uppercase, symbol and eight characters
  function calcPassStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }

  function showError(fieldId, message, isValid) {
    const errorDiv = document.getElementById(`${fieldId}Error`);
    const inputField = document.getElementById(fieldId);

    if (!isValid) {
      errorDiv.textContent = message;
      errorDiv.style.display = "block";
      inputField.classList.add("is-invalid");
      inputField.classList.remove("is-valid");
    } else {
      errorDiv.style.display = "none";
      inputField.classList.remove("is-invalid");
      inputField.classList.add("is-valid");
    }
  }

  // Function to update, display password strength and assign class for css styling
  function updatePassStrength(password) {
    const strengthDiv = document.getElementById("passwordStrength");
    const strength = calcPassStrength(password);

    let strengthText = "";
    let strengthClass = "";

    if (strength < 2) {
      strengthText = "Weak Password";
      strengthClass = "strength-weak";
    } else if (strength < 4) {
      strengthText = "Medium Password";
      strengthClass = "strength-medium";
    } else {
      strengthText = "Strong Password";
      strengthClass = "strength-strong";
    }

    strengthDiv.textContent = strengthText;
    strengthDiv.className = "password-strength " + strengthClass;
  }