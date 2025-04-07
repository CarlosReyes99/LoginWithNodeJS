document.addEventListener("DOMContentLoaded", function () {
    // Mostrar/Ocultar formularios
    document.getElementById("showRegister").addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("loginForm").style.display = "none";
        document.getElementById("registerForm").style.display = "block";
        document.getElementById("registerForm").reset(); // Limpiar el formulario
    });

    document.getElementById("showLogin").addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("registerForm").style.display = "none";
        document.getElementById("loginForm").style.display = "block";
        document.getElementById("loginForm").reset(); // Limpiar el formulario
    });

    // Validación de correo en el registro
    document.getElementById("correo").addEventListener("input", function() {
        let email = this.value;
        let emailError = document.getElementById("emailError");
        let validDomains = ["gmail.com", "hotmail.com", "outlook.com", "unach.mx"];
        let domain = email.split("@")[1];

        if (domain && !validDomains.includes(domain)) {
            emailError.textContent = "Correo no válido. Usa @gmail.com, @hotmail.com, @outlook.com, @unach.mx";
        } else {
            emailError.textContent = "";
        }
    });

    // Validación de contraseña en el registro
    document.getElementById("contraseña").addEventListener("input", function() {
        let password = this.value;
        let passwordError = document.getElementById("passwordError");

        let securityLevel = PasswordUtil.assesPassword(password);

        switch (securityLevel) {
            case PasswordUtil.SecurityLevel.WEAK:
                passwordError.textContent = "Nivel de seguridad bajo, contiene solo letras";
                break;
            case PasswordUtil.SecurityLevel.MEDIUM:
                passwordError.textContent = "Nivel de seguridad medio";
                break;
            case PasswordUtil.SecurityLevel.STRONG:
                passwordError.textContent = "";
                break;
            default:
                passwordError.textContent = "Contraseña inválida";
        }
    });

    // Envío del formulario de registro
    document.getElementById("registerForm").addEventListener("submit", function(event) {
        event.preventDefault();

        let formData = new FormData(this);
        let formDataObject = {};
        
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        fetch("/register", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject)
        })
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("Error en la respuesta del servidor");
            }
        })
        .then(data => {
            console.log("Respuesta del servidor:", data);
            document.getElementById("successMessage").textContent = data;
            if (data.includes("Registro exitoso")) {
                document.getElementById("registerForm").reset();
            }
        })
        .catch(error => {
            console.error("Error en el registro:", error);
            document.getElementById("successMessage").textContent = "Error en el registro. Inténtalo de nuevo.";
        });
    });

    // Envío del formulario de login
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();

        let formData = new FormData(this);
        let formDataObject = {};
        
        formData.forEach((value, key) => {
            formDataObject[key] = value;
        });

        fetch("/login", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formDataObject),
            redirect: 'follow' // Importante: permitir seguir redirecciones
        })
        .then(response => {
            if (response.redirected) {
                // Si el servidor envió una redirección, seguirla
                window.location.href = response.url;
                return;
            } else if (response.ok) {
                return response.text();
            } else {
                return response.text().then(text => {
                    throw new Error(text || "Error en la respuesta del servidor");
                });
            }
        })
        .then(data => {
            if (data) {
                console.log("Respuesta del servidor:", data);
                alert(data);
            }
        })
        .catch(error => {
            console.error("Error en el login:", error);
            alert(error.message || "Error en el login. Inténtalo de nuevo.");
        });
    });
});

// Clase PasswordUtil
class PasswordUtil {
    static SecurityLevel = {
        WEAK: 'WEAK',
        MEDIUM: 'MEDIUM',
        STRONG: 'STRONG',
    };

    static assesPassword(password) {
        if (password != null) {
            if (password.length >= 16) {
                console.log('La contraseña debe ser menor a 16 caracteres');
                return null;
            }
            if (password.length <= 7) {
                console.log('La contraseña debe tener por lo menos 8 caracteres');
                return null;
            }
            if (password.includes(' ')) {
                console.log('La contraseña contiene espacios, no debe contener espacios');
                return null;
            }
            if (/^[\p{L}]+$/u.test(password)) {
                console.log('Nivel de seguridad bajo, contiene solo letras');
                return PasswordUtil.SecurityLevel.WEAK;
            }
            if (/^[a-zA-Z0-9]*$/.test(password)) {
                console.log('Entramos en nivel de seguridad medio');
                return PasswordUtil.SecurityLevel.MEDIUM;
            }
            if (
                password.length >= 8 &&
                /^[a-zA-Z0-9\W]+$/.test(password) &&
                /.*[\W].*/.test(password)
            ) {
                console.log('Entramos a nivel de seguridad alto');
                return PasswordUtil.SecurityLevel.STRONG;
            }
        }
        return PasswordUtil.SecurityLevel.STRONG;
    }
}