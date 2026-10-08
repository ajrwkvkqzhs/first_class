const loginForm = document.querySelector(".login_form");
const userId = document.querySelector("#user_id");
const userPassword = document.querySelector("#user_password");
const loginButton = document.querySelector(".login_btn");
const passwordButton = document.querySelector(".password_toggle");
const idField = document.querySelector(".id_field");
const passwordField = document.querySelector(".password_field");
const page = document.querySelector("#wrap");

// 입력 상태에 따라 로그인 버튼과 오류 메시지 변경
function updateLoginState() {
    const hasId = userId.value.trim() !== "";
    const hasPassword = userPassword.value !== "";

    loginButton.disabled = !(hasId && hasPassword);
    page.classList.toggle("ready", hasId && hasPassword);

    if (hasId) {
        idField.classList.remove("is_error");
        userId.setAttribute("aria-invalid", "false");
    }

    if (hasPassword) {
        passwordField.classList.remove("is_error");
        userPassword.setAttribute("aria-invalid", "false");
    }
}

// 로그인 서버가 없으므로 제출 시 Figma 4번 오류 화면 표시
function showLoginError() {
    [idField, passwordField].forEach((field) => {
        field.classList.add("is_error");
        field.querySelector("input").setAttribute("aria-invalid", "true");
    });
}

userId.addEventListener("input", updateLoginState);
userPassword.addEventListener("input", updateLoginState);

// 비밀번호 표시 / 숨기기
passwordButton.addEventListener("click", () => {
    const isHidden = userPassword.type === "password";

    userPassword.type = isHidden ? "text" : "password";
    passwordButton.setAttribute("aria-pressed", String(isHidden));
    passwordButton.querySelector(".sr-only").textContent = isHidden
        ? "비밀번호 숨기기"
        : "비밀번호 보기";
});

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showLoginError();
});

// 이전 페이지로 돌아가기
document.querySelector(".back_btn").addEventListener("click", () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "../index.html";
    }
});

// 아직 연결되지 않은 계정 / SNS 서비스 안내
document.querySelectorAll("[data-demo]").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        alert(link.dataset.demo + " 기능은 추후 구현 예정입니다.");
    });
});

// Figma 1~4 상태 확인용: ?state=2, ?state=3, ?state=4
const demoState = new URLSearchParams(location.search).get("state");

if (demoState === "2") {
    userId.value = "sp";
}

if (demoState === "3" || demoState === "4") {
    userId.value = demoState === "4" ? "input test값" : "sp";
    userPassword.value = "12345678";
}

updateLoginState();

if (demoState === "4") {
    showLoginError();
}
