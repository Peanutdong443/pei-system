<!-- eslint-disable no-unused-vars -->
<template>
  <div class="main">
    <h3>{{ title }}</h3>
    <van-form @submit="getPatient">
      <van-cell-group inset  :v-show="isLoginVisiable">
        <van-field
          class="insert"
          v-model="pnum"
          name="pnum"
          label="体检者编号"
          placeholder="请输入体检者编号"
          :readonly="isreadonly"
          @onchange="getPatient"
          :rules="[{ required: true, message: '请填写体检者编号' }]"
          clearable
        >
          <template #button>
            <van-icon 
            name="scan" 
            class="scan-icon"
            @click.stop="openScanner"
          />
          </template>
        </van-field>
      </van-cell-group>
      <div class="submit-btn">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          size="large"
          v-show="button_visiable"
        >
          填写问卷
        </van-button>
      </div>
    </van-form>
  </div>
  <!-- 扫码容器 (使用Teleport避免样式冲突) -->
  <teleport to="body">
    <div v-if="showScanner" class="scanner-container">
      <div id="qr-code-scanner" class="scanner-view"></div>
      <van-button 
        class="close-btn" 
        round 
        type="danger" 
        @click="closeScanner"
      >
        关闭扫码
      </van-button>
    </div>
  </teleport>

  <!-- 问卷列表 -->
  <div v-if="patient.PatientId" class="questionnaire-container">
    <van-sticky>
      <van-nav-bar
        title="健康问卷"
        left-text="返回"
        left-arrow
        @click-left="handleBackClick"
        class="custom-nav-bar"
      />
    </van-sticky>

    <van-form class="questionnaire-form">
      <!-- 循环渲染问题组 -->
      <div
        v-for="group in WjTmGroup"
        :key="group.TmGroupId"
        class="question-group"
      >
        <template >
          <!-- 一级标题 -->
            <!-- v-if="group.Sjid === '-1'" -->
              <!-- v-if="group.SySex !== '2' && patient.Sex === '男'" -->
          <van-cell
           
            v-if="group.SySex===Psex||group.SySex==='3'||group.SySex===''"
            :title="group.TmGroupName"
            class="group-title"
          />

          <!-- 二级标题 -->
          <div
            v-for="group1 in group.PeisWjTms"
            :key="group1.TmId"
            class="question-item"
          >
            <!-- 单行文本输入 -->
            <div v-if="group1.KjType === '1'" class="grid-group">
              <!-- 基础信息 -->
              <van-cell
                v-if="group.TmGroupName === '一、基础信息'"
                class="question-label"
                :title="group1.TmName"
                :value="group1.PeisWjTmDas[0].DaName"
                value-class="left-align-value"
              />

              <van-cell-group v-else inset>
                <van-field
                  class="insert-field"
                  v-model="group1.DaName"
                  :rules="[
                    { required: true, message: '请填写' + group1.TmName },
                  ]"
                  :placeholder="'请输入' + group1.TmName"
                  clearable
                />
              </van-cell-group>
            </div>

            <!-- 单选框 -->
            <div v-if="group1.KjType === '4'" class="checkbox-container">
              <div class="checkbox-title" style="text-align: left">
                {{ group1.TmName }}
              </div>
              <div class="checkbox-group">
                <div
                  class="checkbox-item"
                  v-for="group2 in group1.PeisWjTmDas"
                  :key="group2.DaId"
                >
                  <input
                    type="checkbox"
                    v-model="group2.Isxz"
                    @change="setXzState(group1, group2)"
                  />
                  <label>{{ group2.DaName }}</label>
                  <van-field
                    class="aligned-input"
                    v-if="group2.Kzkjlx === '11' && group2.Isxz === true"
                    v-model="group2.Kzda"
                    type="number"
                    :maxlength="3"
                    center:true
                  />
                </div>
              </div>
            </div>

            <!-- 多选框组 -->
            <div v-if="group1.KjType === '5'" class="checkbox-container">
              <div class="checkbox-title" style="text-align: left">
                {{ group1.TmName }}
              </div>
              <div class="checkbox-group">
                <div
                  v-for="group2 in group1.PeisWjTmDas"
                  :key="group2.DaId"
                  class="checkbox-item"
                >
                  <input type="checkbox" v-model="group2.Isxz" />
                  <label :for="group2.DaId">{{ group2.DaName }}</label>
                  <van-field
                    class="aligned-input"
                    v-if="group2.Kzkjlx === '1' && group2.Isxz === true"
                    v-model="group2.Kzda"
                    type="textarea"
                    autosize
                    rows="1"
                    style="width: 300px"
                    input-align="center"
                    center:true
                  />
                </div>
              </div>
            </div>

            <!-- 多行文本框 -->
            <div v-if="group1.KjType === '6'">
              <van-cell :title="group1.TmName" class="question-label" />
            </div>

            <!-- 数字文本框 -->
            <div v-if="group1.KjType === '11'" class="number-input-container">
              <div class="input-title">{{ group1.TmName }}</div>
              <div
                v-for="group2 in group1.PeisWjTmDas"
                :key="group2.DaId"
                class="input-wrapper"
              >
                <van-field
                  class="aligned-input"
                  v-model="group2.DaName"
                  type="number"
                  :maxlength="3"
                  input-align="center"
                />
                <span v-if="group2.Note" class="input-unit">{{
                  group2.Note
                }}</span>
              </div>
            </div>
          </div>
        </template>
       
      </div>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <van-button
          class="button"
          round
          type="primary"
          size="large"
          @click="submitQuestionnaire"
          :disabled="submit_permitted"
        >
          提交问卷
        </van-button>
        &nbsp;
        <van-button
          class="button"
          round
          type="warning"
          size="large"
          @click="reEditQuestionnaire"
          :disabled="submit_permitted"
        >
          重置
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup>
  import { reactive, ref, onMounted, onUnmounted,nextTick } from "vue";
  import { WJTM } from "../config/config.js";
  import { ysnget, ysnpostByJson } from "../utils/request.js";
  import { showFailToast, showSuccessToast } from "vant";
  import { WJID } from "../config/config.js";
import { Html5Qrcode } from "html5-qrcode";

  const pnum = ref("");
    const Psex = ref("");
  const button_visiable = ref(true);
  const isreadonly = ref(false);
  const title = ref(WJTM);
  const patient = reactive({});
  const WjTmGroup = ref([]);
  const submit_permitted = ref(false);
  const isLoginVisiable=ref(true);

  // 返回按钮点击处理
  const handleBackClick = () => {
    button_visiable.value = true;
    isreadonly.value = false;
    patient.PatientId = null;
  };

  // 提交问卷
  async function submitQuestionnaire() {
    //实际提交逻辑

    console.log({
      pid: patient.PatientId,
      wjid: WJID,
      listWjgroups: WjTmGroup.value,
    });

    const data = await ysnpostByJson("/api/PeisWj/saveWjList", {
      pid: patient.PatientId,
      wjid: WJID,
      listWjgroups: WjTmGroup.value,
    });
    if (data.istrue) {
      showSuccessToast("问卷提交成功");
      console.log(data);
    } else showFailToast("问卷提交失败" + data.msg);
    console.log(data);
  }

  //重置问卷
  async function reEditQuestionnaire() {
    showSuccessToast("问卷重置成功");
    const data = await ysnget("/api/PeisWj/delWjtmList", {
      pid: patient.PatientId,
      wjid: WJID,
    });
    if (data.istrue) {
      showSuccessToast("问卷重置成功");
      handleBackClick();
      console.log(WjTmGroup.value);
    } else showFailToast("问卷重置失败" + data.msg);
  }

  onMounted(() => {
    // 检查缓存中是否有patient信息
    const cachedPatient = localStorage.getItem("patient");
    if (cachedPatient != null) {
      console.log("本地有体检者缓存记录");
    }
  });

  onUnmounted(() => {
    localStorage.clear();
    closeScanner();
  });

  async function getPatient() {
    //根据输入的体检者编号获取体检者信息
    const data = await ysnget("/api/PeisWj/GetPatientInfo", {
      pnum: pnum.value,
    });
    if (data.istrue) {
      Object.assign(patient, data.Patient);
      localStorage.setItem("patient", patient); //本地缓存体检者信息
      button_visiable.value = false; //隐藏填写问卷按钮
      isreadonly.value = true; //填写过程中锁定体检者编号不允许修改
      getWJ();
    } else showFailToast("该体检者编号不存在");
  }

  async function getWJ() {
    const WJdata = await ysnget("api/PeisWj/getWjtmGroupList", {
      pid: patient.PatientId,
      wjid: WJID,
    });
    console.log(WJdata);
    console.log(patient);
    submit_permitted.value = false;
    if (WJdata.istrue) {
      WjTmGroup.value = reactive(WJdata.WjTmGroup);
      WjTmGroup.value[0].PeisWjTms[0].PeisWjTmDas[0].DaName =
        patient.PatientName;
      WjTmGroup.value[0].PeisWjTms[1].PeisWjTmDas[0].DaName =
        patient.PatientType === "1" ? "男" : "女";
      WjTmGroup.value[0].PeisWjTms[2].PeisWjTmDas[0].DaName =
        patient.PatientDaId;

      console.log(WjTmGroup.value);
    } else {
      showFailToast("问卷数据获取失败！！" + WJdata.msg);
      submit_permitted.value = true;
    }

    //渲染问卷
  }

  function setXzState(question, option) {
    for (let i = 0; i < question.PeisWjTmDas.length; i++) {
      question.PeisWjTmDas[i].Isxz = false;
    }
    option.Isxz = true;
  }

const showScanner = ref(false);
const html5QrcodeScanner = ref(null);
const isScannerRunning = ref(false);

const openScanner = async () => {
  try {
    if (isScannerRunning.value) return;
    
    showScanner.value = true;
    await nextTick();
    
    html5QrcodeScanner.value = new Html5Qrcode("qr-code-scanner");
    await html5QrcodeScanner.value.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        pnum.value = extractPnumFromQR(decodedText);
        closeScanner();
      },
      undefined  // 不显示内置错误UI
    );
    
    isScannerRunning.value = true;
  } catch (err) {
    console.error("Scanner start failed:", err);
    closeScanner();
  }
};

const closeScanner = async () => {
  if (!html5QrcodeScanner.value || !isScannerRunning.value) {
    showScanner.value = false;
    return;
  }
  
  try {
    await html5QrcodeScanner.value.stop();
    console.log("Scanner stopped successfully");
  } catch (stopErr) {
    console.warn("Scanner stop warning:", stopErr);
  } finally {
    html5QrcodeScanner.value = null;
    isScannerRunning.value = false;
    showScanner.value = false;
  }
};

const extractPnumFromQR = (text) => {
  // 实现你的提取逻辑
  return text.match(/\d+/)?.[0] || text;
};
</script>

<style scoped>
  /* ========== 全局变量和基础样式 ========== */
  :root {
    --primary-color: #4361ee; /* 主蓝色 */
    --secondary-color: #3a0ca3; /* 深蓝色 */
    --success-color: #4cc9f0; /* 亮蓝色 */
    --warning-color: #f8961e; /* 橙色 */
    --danger-color: #f72585; /* 粉色 */
    --light-color: #f8f9fa; /* 浅灰 */
    --dark-color: #212529; /* 深灰 */
    --text-color: #2b2d42; /* 主要文字颜色 */
    --border-color: #e9ecef; /* 边框颜色 */
    --background-color: #ffffff; /* 背景白色 */
    --shadow-color: rgba(0, 0, 0, 0.1); /* 阴影颜色 */
  }

  body {
    font-family: "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    color: var(--text-color);
    background-color: #f5f7fa; /* 更柔和的背景色 */
    line-height: 1.6;
  }

  /* ========== 主容器样式 ========== */
  .main {
    max-width: 800px;
    margin: 20px auto;
    padding: 24px;
    background: var(--background-color);
    border-radius: 12px;
    box-shadow: 0 4px 20px var(--shadow-color);
  }

  /* ========== 标题样式 ========== */
  h3 {
    text-align: center;
    color: var(--secondary-color);
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 24px;
    padding-bottom: 16px;
    position: relative;
  }

  h3::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: var(--success-color);
  }

  /* ========== 导航栏 ========== */
  .custom-nav-bar {
    --van-nav-bar-background: #7087e9;
    --van-nav-bar-title-text-color: white;
    --van-nav-bar-text-color: white;
    --van-nav-bar-arrow-color: white;
    --van-nav-bar-title-font-size: 23px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  /* ========== 表单元素 ========== */
  /* 输入框通用样式 */
  .input-with-note {
    display: flex;
    align-items: center; /* 垂直居中 */
    gap: 8px; /* 设置间距 */
  }
  .note-text {
    font-size: 16px;
    white-space: nowrap; /* 防止换行 */
  }
  .van-field,
  .insert {
    background-color: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px 16px;
    font-size: 16px;
    transition: all 0.3s ease;
  }

  .van-field:hover,
  .insert:hover {
    border-color: #b4c1fe;
  }

  .van-field:focus,
  .insert:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
    outline: none;
  }

  .insert-field {
    box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1);
  }

  /* 单选/复选框 */
  .van-radio-group {
    padding: 10px 0;
  }

  .van-radio {
    margin-right: 24px;
  }

  .van-radio__icon,
  .checkbox-item input[type="checkbox"] {
    border: 2px;
    transition: all 0.2s ease;
  }

  .van-radio__icon--checked,
  .checkbox-item label {
    margin-left: 8px;
    cursor: pointer;
  }

  /* ========== 问题组样式 ========== */
  .question-group {
    margin-bottom: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .group-title {
    font-size: 1.1rem;
    color: black;
    background: linear-gradient(
      135deg,
      var(--primary-color),
      var(--secondary-color)
    );
    padding: 14px 16px;
    background-color: #f0f7ff;
    text-align: left;
  }

  .question-item {
    padding: 16px;
    border-bottom: 1px solid #f0f0f0;
    transition: transform 0.3s ease;
  }

  .question-item:last-child {
    border-bottom: none;
  }

  /* ========== 复选框组 ========== */
  .checkbox-container {
    margin-top: 16px;
  }

  .checkbox-title {
    font-weight: 500;
    margin-bottom: 12px;
    color: var(--text-color);
  }

  .checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 0;
  }

  .checkbox-item {
    display: flex;
    align-items: center;
    min-width: 120px;
    padding: 8px 12px;
    background: var(--light-color);
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  /* ========== 按钮样式 ========== */
  .van-button {
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
    border: none;
  }

  .van-button--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(67, 97, 238, 0.3);
  }

  .submit-btn,
  .submit-section {
 position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 16px;
  background: #fff;
  z-index: 100;
  margin-top: auto; /* 确保在flex布局中生效 */
  /* 半透明渐变背景 */
  background: linear-gradient(
    to top,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  
  /* 现代浏览器模糊效果 */
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  
  /* 安全区域适配 */
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }

  /* ========== 网格布局 ========== */
  .grid-group {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
  }

  /* ========== 动画效果 ========== */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .questionnaire-container {
    animation: fadeIn 0.5s ease-out;
  }

  /* ========== 响应式设计 ========== */
  @media (max-width: 600px) {
    .main {
      padding: 12px;
      margin: 10px;
      border-radius: 0;
    }

    .grid-group {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .checkbox-group {
      flex-direction: column;
      gap: 8px;
    }

    .checkbox-item {
      width: 100%;
    }

    .insert {
      width: 100% !important;
    }

    .van-field,
    .insert {
      padding: 10px 12px;
    }
  }

  /* ========== 特殊样式 ========== */
  .question-label {
    font-size: 16px;
    font-weight: 500;
    --van-cell-horizontal-padding: 20px;
  }

  .pid-insert {
    font-size: 17px;
    --van-field-label-color: var(--secondary-color);
  }

  /* 数字输入框移除箭头 */
  .insert[type="number"]::-webkit-inner-spin-button,
  .insert[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .button {
    width: 150px;
  }
  :deep(.left-align-value) {
    text-align: center;
    justify-content: flex-start;
    flex: 1; /* 确保占据剩余空间 */
  }
  /* 容器样式 */
  .number-input-container {
    display: flex;
    align-items: baseline; /* 关键：基于基线对齐 */
    padding: 12px 16px 0px 0px;
    gap: 8px;
  }

  /* 题目样式 */
  .input-title {
    font-weight: 500;
    white-space: nowrap; /* 防止换行 */
  }

  /* 输入框容器 */
  .input-wrapper {
    display: inline-flex;
    align-items: flex-end; /* 底部对齐 */
  }

  /* 输入框样式 */
  .aligned-input {
    border: none;
    border-bottom: 1px solid #ddd;
    width: 50px;
    border-radius: 0px;
    padding: 0 0 0px 0; /* 下padding控制下划线位置 */
    text-align: center;
    font-size: 16px;
    background: transparent;
    caret-color: auto;
    align-items: center;
  }

  /* 单位文字样式 */
  .input-unit {
    margin-left: 4px;
    margin-bottom: 0px;
    font-size: 16px;
  }

  /* 移除数字输入框的箭头 */
  .aligned-input[type="number"]::-webkit-inner-spin-button,
  .aligned-input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .scan-icon {
  font-size: 20px;
  color: var(--van-primary-color);
  padding: 0 10px;
}

/* 扫码容器样式 */
.scanner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: black;
  z-index: 2000;
  display: flex;
  flex-direction: column;
}

.scanner-view {
  flex: 1;
  width: 100%;
}

.close-btn {
  margin: 20px auto;
  width: 80%;
}
</style>
