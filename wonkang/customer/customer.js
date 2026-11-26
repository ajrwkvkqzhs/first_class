'use strict';
const form = document.querySelector('#inquiry-form');
if (form) {
  const params = new URLSearchParams(location.search);
  for (const key of ['product','type']) {
    const field = form.elements.namedItem(key);
    if ([...field.options].some(o => o.value === params.get(key))) field.value = params.get(key);
  }
  const result = document.querySelector('#inquiry-result');
  const preview = document.querySelector('#inquiry-preview');
  const feedback = form.querySelector('.customer-feedback');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const label = key => form.elements.namedItem(key).selectedOptions[0].textContent;
    preview.textContent = ['문의 유형: '+label('type'),'제품군: '+label('product'),'회사명: '+(data.get('company')||'-'),'담당자: '+data.get('person'),'이메일: '+data.get('email'),'연락처: '+(data.get('phone')||'-'),'제목: '+data.get('subject'),'',data.get('message')].join('\n');
    result.hidden = false;
    feedback.textContent = '문의 내용을 정리했습니다. 실제로 접수되거나 발송되지 않았습니다.';
    result.scrollIntoView({block:'nearest'});
  });
  form.addEventListener('input', () => { result.hidden = true; preview.textContent = ''; feedback.textContent = ''; });
  document.querySelector('#copy-inquiry').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(preview.textContent); feedback.textContent = '문의 내용이 복사되었습니다.'; }
    catch { feedback.textContent = '미리보기 내용을 직접 선택해 복사해 주세요.'; }
  });
  form.querySelector('[type="submit"]').disabled = false;
}
const printButton = document.querySelector('#print-catalog');
if (printButton) { printButton.hidden = false; printButton.addEventListener('click', () => window.print()); }
