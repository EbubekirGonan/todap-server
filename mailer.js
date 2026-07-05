'use strict';

const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const MAIL_TO = process.env.MAIL_TO || 'todap.der@gmail.com';
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER || 'todap.der@gmail.com';

function isMailerConfigured() {
  return !!(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }
  return transporter;
}

async function sendFormNotification({ subject, fields }) {
  if (!isMailerConfigured()) {
    console.warn('[mailer] SMTP ayarlari eksik, e-posta gonderimi atlandi.');
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const lines = Object.entries(fields).map(([key, value]) => `${key}: ${String(value || '—')}`);
  const htmlRows = Object.entries(fields)
    .map(([key, value]) => `<tr><td style="padding:6px 10px;font-weight:700">${escapeHtml(key)}</td><td style="padding:6px 10px">${escapeHtml(value || '—')}</td></tr>`)
    .join('');

  const info = await getTransporter().sendMail({
    from: MAIL_FROM,
    to: MAIL_TO,
    subject,
    text: lines.join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2 style="margin:0 0 12px 0">${escapeHtml(subject)}</h2>
        <table style="border-collapse:collapse;border:1px solid #ddd">${htmlRows}</table>
      </div>
    `
  });

  return { sent: true, messageId: info.messageId };
}

async function sendContactNotification(payload) {
  const now = new Date().toLocaleString('tr-TR');
  return sendFormNotification({
    subject: 'TODAP site: Yeni iletisim mesaji',
    fields: {
      Tarih: now,
      Isim: payload.isim,
      'E-posta': payload.eposta,
      Konu: payload.konu || '—',
      Mesaj: payload.mesaj
    }
  });
}

async function sendMembershipNotification(payload) {
  const now = new Date().toLocaleString('tr-TR');
  return sendFormNotification({
    subject: 'TODAP site: Yeni uyelik basvurusu',
    fields: {
      Tarih: now,
      Ad: payload.ad,
      Soyad: payload.soyad,
      'E-posta': payload.eposta,
      Telefon: payload.telefon || '—',
      'Meslek / Unvan': payload.meslek || '—',
      'Calisma Alani': payload.alan || '—',
      Sehir: payload.sehir || '—',
      Neden: payload.neden || '—'
    }
  });
}

module.exports = {
  isMailerConfigured,
  sendContactNotification,
  sendMembershipNotification
};