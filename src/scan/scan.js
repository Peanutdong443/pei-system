import { Html5Qrcode } from "html5-qrcode";

export async function scanQRCode(containerId) {
  const html5Qrcode = new Html5Qrcode(containerId);
  
  try {
    const result = await html5Qrcode.start(
      { facingMode: "environment" }, // 使用后置摄像头
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        // 成功回调
        return decodedText;
      },
      (errorMessage) => {
        // 错误处理
        throw new Error(errorMessage);
      }
    ).catch(err => {
      if (err === 'NotAllowedError') {
        throw new Error('请允许摄像头访问权限');
      }
      throw err;
    });

    // 解析结果
    return extractPnumFromQR(result);
  } finally {
    await html5Qrcode.stop();
  }
}

// 提取函数保持不变
const extractPnumFromQR = (qrContent) => {
  if (/^\d+$/.test(qrContent)) return qrContent;
  const match = qrContent.match(/pnum=(\d+)/);
  if (match) return match[1];
  try {
    const data = JSON.parse(qrContent);
    return data.pnum || data.id;
  } catch {
    return null;
  }
};