// 전역 변수
let menuItems = [];
let itemIdCounter = 1;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
  console.log('ChurchPP Tools 초기화');
});

// 다이얼로그 관리
function openAddDialog() {
  document.getElementById('dialog-overlay').style.display = 'block';
}

function closeAddDialog() {
  document.getElementById('dialog-overlay').style.display = 'none';
  // 선택된 템플릿 초기화
  document.querySelectorAll('.template-option').forEach(option => {
    option.classList.remove('selected');
  });
}

function selectTemplate(element) {
  // 이전 선택 제거
  document.querySelectorAll('.template-option').forEach(option => {
    option.classList.remove('selected');
  });
  // 새 선택 추가
  element.classList.add('selected');
}

function addNewItem() {
  const selectedTemplate = document.querySelector('.template-option.selected');
  if (!selectedTemplate) {
    alert('템플릿을 선택해주세요.');
    return;
  }

  const templateType = selectedTemplate.dataset.template;
  const itemName = `새 항목 ${itemIdCounter}`;
  const itemId = `item-${itemIdCounter}`;
  
  const newItem = {
    id: itemId,
    name: itemName,
    template: templateType,
    data: {
      files: []
    }
  };

  menuItems.push(newItem);
  itemIdCounter++;

  console.log('새 아이템 추가:', newItem);

  // 사이드바에 버튼 추가
  createSidebarButton(newItem);
  
  // 콘텐츠 페이지 생성
  createContentPage(newItem);
  
  // 잠시 기다린 후 페이지 표시 (DOM 업데이트 대기)
  setTimeout(() => {
    // 환영 화면 숨기기
    document.getElementById('welcome-screen').style.display = 'none';
    
    // 새로 생성된 페이지로 이동
    showContentPage(itemId);
  }, 10);
  
  closeAddDialog();
}

function createSidebarButton(item) {
  const sidebar = document.getElementById('sidebar-menu');
  const li = document.createElement('li');
  
  const icon = getTemplateIcon(item.template);
  
  li.innerHTML = `
    <a href="#" data-item-id="${item.id}" onclick="showContentPage('${item.id}')">
      <span class="icon">${icon}</span>
      <span>${item.name}</span>
    </a>
  `;
  
  sidebar.appendChild(li);
}

function getTemplateIcon(template) {
  const icons = {
    'basic': '📄',
    'praise': '🎵',
    'reading': '📖',
    'bible': '✝️',
    'custom': '⚙️'
  };
  return icons[template] || '📄';
}

function createContentPage(item) {
  let template = '';
  
  if (item.template === 'basic') {
    // 기본 템플릿을 직접 문자열로 생성
    template = `
      <div class="content-page" data-item-id="${item.id}" style="display: none;">
        <!-- 헤더 카드 -->
        <div class="content-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 20px;">📄</span>
            <div style="flex: 1;">
              <input type="text" id="item-name-${item.id}" value="${item.name}" onchange="updateItemName('${item.id}', this.value)" 
                     style="border: none; background: transparent; font-size: 14px; font-weight: bold; width: 100%; margin: 0; padding: 2px 4px; border-radius: 3px;"
                     onmouseover="this.style.backgroundColor='#f8f9fa'" 
                     onmouseout="this.style.backgroundColor='transparent'">
              <span style="color: #6c757d; font-size: 12px;">기본 템플릿</span>
            </div>
            <button class="delete-btn" onclick="deleteItem('${item.id}')" title="이 항목 삭제">
              🗑️ 삭제
            </button>
          </div>
        </div>

        <!-- 파일 업로드 카드 -->
        <div class="content-card">
          <h3>파일 업로드</h3>
          <button class="file-upload-btn" onclick="selectFiles('${item.id}')">
            📁 이미지 파일 선택
          </button>
          <input type="file" id="file-input-${item.id}" accept="image/*" multiple onchange="handleFileSelection(event, '${item.id}')" class="file-input">
          
          <!-- 미리보기 컨테이너 -->
          <div class="preview-container" id="preview-${item.id}">
            <div class="main-preview" id="main-preview-${item.id}">
              <div class="placeholder">파일을 업로드하면 여기에 미리보기가 표시됩니다</div>
            </div>
            <div class="slide-thumbnails" id="thumbnails-${item.id}"></div>
          </div>
        </div>
      </div>
    `;
  } else {
    // 다른 템플릿들은 기본 구조
    template = `
      <div class="content-page" data-item-id="${item.id}" style="display: none;">
        <div class="content-card">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
            <span style="font-size: 20px;">${getTemplateIcon(item.template)}</span>
            <div style="flex: 1;">
              <input type="text" id="item-name-${item.id}" value="${item.name}" onchange="updateItemName('${item.id}', this.value)" 
                     style="border: none; background: transparent; font-size: 14px; font-weight: bold; width: 100%; margin: 0; padding: 2px 4px; border-radius: 3px;"
                     onmouseover="this.style.backgroundColor='#f8f9fa'" 
                     onmouseout="this.style.backgroundColor='transparent'">
              <span style="color: #6c757d; font-size: 12px;">${item.template} 템플릿</span>
            </div>
            <button class="delete-btn" onclick="deleteItem('${item.id}')" title="이 항목 삭제">
              🗑️ 삭제
            </button>
          </div>
          <p style="color: #6c757d; font-size: 12px; margin-top: 15px;">이 템플릿은 아직 구현되지 않았습니다.</p>
        </div>
      </div>
    `;
  }
  
  const mainContent = document.querySelector('.main-content');
  if (!mainContent) {
    console.error('main-content 요소를 찾을 수 없습니다');
    return;
  }
  
  // 기존에 같은 ID의 페이지가 있다면 제거
  const existingPage = document.querySelector(`.content-page[data-item-id="${item.id}"]`);
  if (existingPage) {
    existingPage.remove();
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = template;
  const contentPage = tempDiv.firstElementChild;
  
  if (contentPage) {
    mainContent.appendChild(contentPage);
    console.log(`콘텐츠 페이지 생성됨: ${item.id}`, contentPage);
  } else {
    console.error(`콘텐츠 페이지 생성 실패: ${item.id}`);
  }
}

function createBasicContentPage(item) {
  const template = `
    <div class="content-page" data-item-id="${item.id}" style="display: none;">
      <div class="content-card">
        <h3>${item.name}</h3>
        <p style="color: #6c757d;">템플릿을 불러올 수 없습니다.</p>
      </div>
    </div>
  `;
  
  const mainContent = document.querySelector('.main-content');
  mainContent.insertAdjacentHTML('beforeend', template);
}

function showContentPage(itemId) {
  console.log(`페이지 표시 요청: ${itemId}`);
  
  // 모든 콘텐츠 페이지 숨기기
  document.querySelectorAll('.content-page').forEach(page => {
    page.style.display = 'none';
  });
  
  // 환영 화면 숨기기
  document.getElementById('welcome-screen').style.display = 'none';
  
  // 선택된 콘텐츠 페이지 찾기 (content-page 클래스와 data-item-id 조합으로)
  const targetPage = document.querySelector(`.content-page[data-item-id="${itemId}"]`);
  console.log(`찾은 콘텐츠 페이지:`, targetPage);
  
  if (targetPage) {
    targetPage.style.display = 'block';
    console.log(`페이지 표시됨: ${itemId}`);
  } else {
    console.error(`페이지를 찾을 수 없음: ${itemId}`);
  }
  
  // 사이드바 활성 상태 업데이트
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.classList.remove('active');
  });
  
  const activeLink = document.querySelector(`.sidebar-menu a[data-item-id="${itemId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// 파일 관리
function selectFiles(itemId) {
  const fileInput = document.getElementById(`file-input-${itemId}`);
  fileInput.click();
}

function updateItemName(itemId, newName) {
  const item = menuItems.find(item => item.id === itemId);
  if (item) {
    item.name = newName;
    // 사이드바 업데이트
    const sidebarLink = document.querySelector(`[data-item-id="${itemId}"] span:last-child`);
    if (sidebarLink) {
      sidebarLink.textContent = newName;
    }
  }
}

function deleteItem(itemId) {
  const item = menuItems.find(item => item.id === itemId);
  if (!item) return;
  
  // 삭제 확인
  const confirmDelete = confirm(`"${item.name}" 항목을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
  if (!confirmDelete) return;
  
  console.log(`항목 삭제: ${itemId}`);
  
  // menuItems 배열에서 제거
  const itemIndex = menuItems.findIndex(item => item.id === itemId);
  if (itemIndex !== -1) {
    menuItems.splice(itemIndex, 1);
  }
  
  // 사이드바에서 버튼 제거
  const sidebarButton = document.querySelector(`.sidebar-menu a[data-item-id="${itemId}"]`);
  if (sidebarButton) {
    sidebarButton.parentElement.remove(); // li 요소 제거
  }
  
  // 콘텐츠 페이지 제거
  const contentPage = document.querySelector(`.content-page[data-item-id="${itemId}"]`);
  if (contentPage) {
    contentPage.remove();
  }
  
  // 다른 항목이 있으면 첫 번째 항목을 표시, 없으면 환영 화면 표시
  if (menuItems.length > 0) {
    showContentPage(menuItems[0].id);
  } else {
    document.getElementById('welcome-screen').style.display = 'block';
  }
  
  console.log(`삭제 완료. 남은 항목 수: ${menuItems.length}`);
}

function handleFileSelection(event, itemId) {
  const files = event.target.files;
  const item = menuItems.find(item => item.id === itemId);
  
  if (!item) return;
  
  const mainPreview = document.getElementById(`main-preview-${itemId}`);
  const thumbnails = document.getElementById(`thumbnails-${itemId}`);
  
  // 기존 썸네일 초기화
  thumbnails.innerHTML = '';
  item.data.files = [];
  
  // 파일 처리
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const imageData = e.target.result;
        item.data.files.push({
          name: file.name,
          type: 'image',
          data: imageData
        });
        
        // 첫 번째 이미지를 메인 미리보기에 표시
        if (i === 0) {
          mainPreview.innerHTML = `<img src="${imageData}" alt="${file.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        }
        
        // 썸네일 생성
        const thumbnail = document.createElement('div');
        thumbnail.className = 'slide-thumbnail';
        if (i === 0) thumbnail.classList.add('active');
        thumbnail.innerHTML = `<img src="${imageData}" alt="${file.name}">`;
        thumbnail.onclick = function() {
          mainPreview.innerHTML = `<img src="${imageData}" alt="${file.name}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
          document.querySelectorAll(`#thumbnails-${itemId} .slide-thumbnail`).forEach(t => t.classList.remove('active'));
          thumbnail.classList.add('active');
        };
        thumbnails.appendChild(thumbnail);
      };
      reader.readAsDataURL(file);
  }
}


// 슬라이드쇼 시작
function startSlideshow() {
  console.log('슬라이드쇼 시작');
  
  const allSlides = [];
  menuItems.forEach(item => {
    if (item.data.files && item.data.files.length > 0) {
      item.data.files.forEach(file => {
        if (file.type === 'image') {
          allSlides.push({
            type: 'image',
            data: file.data,
            name: file.name
          });
      });
    }
  });
  
  if (allSlides.length === 0) {
    alert('슬라이드쇼를 시작하려면 먼저 이미지 파일을 업로드해주세요.');
    return;
  }
  
  // Store slides data for slideshow window
  window.slideshowData = allSlides;
  
  // 새 창에서 슬라이드쇼 열기
  const slideshowWindow = window.open('slideshow.html', '_blank', 'width=1024,height=768');
  
  // 슬라이드쇼 창이 로드되면 데이터 전달
  slideshowWindow.addEventListener('load', function() {
    if (slideshowWindow.initSlideshow) {
      slideshowWindow.initSlideshow(window.slideshowData);
    }
  });
}

// 데이터 저장/불러오기
function saveData() {
  console.log('데이터 저장');
  const data = {
    items: menuItems,
    lastSaved: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'church_pp_data.json';
  a.click();
  URL.revokeObjectURL(url);
}

function loadData() {
  console.log('데이터 불러오기');
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const data = JSON.parse(e.target.result);
          if (data.items) {
            menuItems = data.items;
            loadAllItems();
            alert('데이터를 성공적으로 불러왔습니다.');
          }
        } catch (error) {
          alert('파일을 읽는 중 오류가 발생했습니다.');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function loadAllItems() {
  const sidebarMenu = document.getElementById('sidebar-menu');
  const mainContent = document.querySelector('.main-content');
  
  // 기존 항목들 제거
  sidebarMenu.innerHTML = '';
  document.querySelectorAll('.content-page').forEach(page => page.remove());
  
  // 모든 항목 다시 생성
  menuItems.forEach(item => {
    createSidebarButton(item);
    createContentPage(item);
  });
  
  // 환영 화면 다시 보이기
  document.getElementById('welcome-screen').style.display = 'block';
}

// 이벤트 리스너
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveData();
  } else if (e.ctrlKey && e.key === 'o') {
    e.preventDefault();
    loadData();
  }
});

// 다이얼로그 외부 클릭시 닫기
document.addEventListener('DOMContentLoaded', function() {
  const dialogOverlay = document.getElementById('dialog-overlay');
  if (dialogOverlay) {
    dialogOverlay.addEventListener('click', function(e) {
      if (e.target === this) {
        closeAddDialog();
      }
    });
  }
});