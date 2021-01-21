// 자주 사용되는 HTML 요소들을 저장해두기 위한 변수
let newTodoInput = null
let todoList = null
let todoElements = null
let todoListCount = 0
let filters = null
let filterAll = null
let filterActive = null
let filterCompleted = null
let filterContainer = null
let selectedFilter = null
// 자주 사용되는 객체, 상수값을 저장해두기 위한 변수
let todoElementsNameArray = null
const ToDoElementStorage = window.localStorage
const ENTER_KEYCODE = 13
const ESC_KEYCODE = 27
const KEYWORD = "gTZ5JMw51a"

// 웹페이지 로드 시 실행되는 함수
function init(){
    // 초기화되지 않은 변수들을 HTML 요소로 초기화
    newTodoInput = document.getElementById('new-todo-title')
    todoList = document.getElementById('todo-list')
    todoElements = todoList.children
    filters = document.querySelector('ul.filters')
    filterAll = filters.querySelector('li a.all')
    filterActive = filters.querySelector('li a.active')
    filterCompleted = filters.querySelector('li a.completed')
    // 해당 변수들에 대한 적절한 이벤트 처리기 등록
    newTodoInput.addEventListener('keydown', addNewTodo)
    filterAll.addEventListener('click', filterAllViewChange)
    filterActive.addEventListener('click', filterActiveViewChange)
    filterCompleted.addEventListener('click', filterCompletedViewChange)
    filterContainer = [filterAll, filterActive, filterCompleted]
    selectedFilter = filterAll

    // 저장된 할 일 항목이 있는지 확인, 있다면 불러오고 없다면 초기화.
    todos = ToDoElementStorage.getItem(KEYWORD)
    if(todos == null){
        todos = JSON.stringify([])
        ToDoElementStorage.setItem(KEYWORD, todos)
    }
    todoElementsNameArray = JSON.parse(todos)
    // 저장된 할 일 항목 각각에 대해 할일 추가 로직 수행.
    todoElementsNameArray.forEach(elementName =>
        drawNewTodo({'text':elementName, 'isDone':localStorage.getItem(elementName)})
    )
    
}

// 사용자 입력으로 새로운 할 일이 추가되는 함수
function addNewTodo(event){
    // 기본적인 예외 처리(공백 문자열, 중복 할 일 등)
    text = newTodoInput.value.trimStart().trimEnd()
    if(event.keyCode != ENTER_KEYCODE || text.length == 0){
        newTodoInput.focus()
        return;
    }

    if(todoElementsNameArray.indexOf(text) >= 0){
        alert('That ToDo is already exist!')
        return;
    }

    newTodoInput.value = ''
    // 별 문제가 없다면 입력된 내용으로 새로운 할 일을 추가.
    drawNewTodo({'text':text,'isDone':'false'})
    // 브라우저 localStorage에도 해당 할 일 저장 후 현재 선택된 필터에 맞게 가시성 조절.
    ToDoElementStorage.setItem(text, false)
    selectedFilter.dispatchEvent(new Event('click'))
    // 내부적으로 유지하고 있는 할 일 리스트에도 저장 후 이 리스트 역시 localStorage에 저장.
    todoElementsNameArray.push(text)
    ToDoElementStorage.setItem(KEYWORD, JSON.stringify(todoElementsNameArray))
    /**
     * 왜 localStorage에도 저장하고 할 일 리스트에도 저장 후 다시 리스트를 localStorage에도 저장하는가?
     * --> 현재 localStorage에는 다음과 같은 항목들이 저장됨.
     *     - 할 일의 리스트({KEYWORD: ['todo1', 'todo2', ...]})
     *     - 어떤 할 일의 완료 여부({'todo1':true}, {'todo2':false})
     *     할 일 내용의 리스트는 페이지 로드 시 저장되어 있는 할 일들을 불러오기 위해서 KEYWORD 상수키의 값으로 저장하고 있음.
     *     각각의 할 일들은 자신을 키로 하여 localStorage에 저장된 값(true/false)을 불러와서 할 일 완료 여부를 파악
     *     즉 페이지 로드 시 다음과 같이 동작함.
     *     - localStorage에서 KEYWORD 상수키의 값을 불러와 할 일 목록에 저장.
     *     - 할 일 목록에 저장된 할 일들에 대하여 각각(forEach) 자신을 키로 하여 localStorage에서 완료 여부를 가져옴.
     *     - 할 일 목록에 저장된 할 일들은 완료 여부에 따라 할 일 추가 시 checked 속성 부여
     *     할 일이 추가되거나 삭제, 변경 시 localStorage에 저장된 할 일의 완료 여부 뿐 아니라 할 일의 리스트에도 적용
     *     결과적으로 재접속 시에도 변경사항이 유지되도록 함.
     * 
     *     최적의 방법은 아닐듯.
     */
}

// 할 일 추가 시 실제로 HTML 요소를 그리는 함수
function drawNewTodo(todo){
    newTodoHTMLElement = `
        <li>
            <div class="view">
                <input class="toggle" type="checkbox" onclick="toggleTodoElementStatus(event)">
                <label class="label" ondblclick="toggleTodoElementMode(event)">${todo.text}</label>
                <button class="destroy" onclick="removeCurrentTodoElement(event)"></button>
            </div>
            <input class="edit" onkeydown="updateTodoEdit(event)" value=${todo.text}></input>
        </li>
    `
    todoList.innerHTML += newTodoHTMLElement
    updateCountText(1)
    if(todo.isDone === 'true'){
        todoList.children[todoList.children.length - 1].querySelector('li div input.toggle').dispatchEvent(new Event('click'))
    }
}

// 전체보기 필터링
function filterAllViewChange(event){
    selectedFilter = filterAll
    for(i=0;i<filterContainer.length;i++) {
        filterContainer[i].classList.remove('selected')
    }
    filterAll.classList.add('selected')
    // display 속성을 조절하여 가시성 토글. 다른 필터링도 동일.
    for(index=0;index<todoListCount;index++){
        todoElements[index].style.display = ""
    }
}
// 해야할 일 필터링
function filterActiveViewChange(event){
    selectedFilter = filterActive
    for(i=0;i<filterContainer.length;i++) {
        filterContainer[i].classList.remove('selected')
    }
    filterActive.classList.add('selected')
    
    for(index=0;index<todoListCount;index++){
        if(todoElements[index].querySelector('div input').getAttribute('checked') != null){
            todoElements[index].style.display = "none"
        } else {
            todoElements[index].style.display = ""
        }
    }
}
// 완료한 일 필터링
function filterCompletedViewChange(event){
    selectedFilter = filterCompleted
    for(i=0;i<filterContainer.length;i++) {
        filterContainer[i].classList.remove('selected')
    }
    filterCompleted.classList.add('selected')
    
    for(index=0;index<todoListCount;index++){
        if(todoElements[index].querySelector('div input').getAttribute('checked') == null){
            todoElements[index].style.display = "none"
        } else {
            todoElements[index].style.display = ""
        }
    }
}

// 할 일 삭제 이벤트 처리기.
function removeCurrentTodoElement(event){
    // 삭제된 할 일을 할 일 목록에서 제거.
    removedTodoName = event.target.parentNode.querySelector('label').innerText
    todoElementsNameArray.splice(todoElementsNameArray.indexOf(removedTodoName), 1)
    // localStorage에 저장된 할 일 데이터를 지우고 할 일 목록을 업데이트.
    ToDoElementStorage.removeItem(removedTodoName)
    ToDoElementStorage.setItem(KEYWORD, JSON.stringify(todoElementsNameArray))
    // 실제로 HTML 요소를 삭제하고 카운터 업데이트.
    event.target.parentNode.parentNode.remove()
    updateCountText(-1)
}

// 할 일 변경 이벤트 처리기.
function updateTodoEdit(event){
    todoElementLI = event.target.parentNode
    // ESC를 눌렀다면 편집 모드 종료, Enter를 눌렀다면 편집 적용.
    if(event.keyCode == ESC_KEYCODE){
        todoElementLI.classList.toggle('editing')
    } else if (event.keyCode == ENTER_KEYCODE){
        // 각각 변경된 할 일 텍스트, 원래 할 일 텍스트.
        newTodoText = event.target.value.trimStart().trimEnd()
        updatedTodoText = todoElementLI.querySelector('div label').innerText
        
        // 입력값 필터링.
        if(newTodoText.length == 0){
            event.target.focus()
        }
        is_dup = false
        todoElementsNameArray.forEach(element => {
            if(element == newTodoText){
                is_dup = true
            }
        })
        if(is_dup){
            alert('That ToDo is already exist!')
            return;
        }

        // localStorage에서 해당 할 일의 완료 여부를 가져와서 따로 저장 후 해당 할 일 삭제.
        status = ToDoElementStorage.getItem(updatedTodoText)
        ToDoElementStorage.removeItem(updatedTodoText)
        // localStorage에 변경된 할 일의 텍스트로 새로운 항목 저장. 위에서 따로 저장해둔 완료 여부를 적용.
        ToDoElementStorage.setItem(newTodoText, status)
        // 할 일 목록에서도 변경사항 적용 및 localStorage에 반영.
        todoElementsNameArray.splice(todoElementsNameArray.indexOf(updatedTodoText), 1, newTodoText)
        ToDoElementStorage.setItem(KEYWORD, JSON.stringify(todoElementsNameArray))
        // HTML 요소에서도 변경사항 적용.
        todoElementLI.querySelector('div label').innerText = newTodoText
        todoElementLI.classList.toggle('editing')
    }
}

function updateView(){
    // ??? 구현 예정.
}

// 할 일이 몇 개 있는지 출력하는 텍스트(총 n 개)를 업데이트하는 로직.
function updateCountText(change=0){
    todoListCount += change
    todoListCountText = document.querySelector('span.todo-count strong')
    todoListCountText.innerText = todoListCount
}

// 할 일을 더블클릭 했을 때 편집 모드 토글 로직.
function toggleTodoElementMode(event){
    todoElementLI = event.target.parentNode.parentNode
    todoElementLI.classList.toggle('editing')
}

// 할 일 완료 여부 체크/체크 해제 시 속성 부여, 제거 로직.
function toggleTodoElementStatus(event){
    isChecked = event.target.getAttribute('checked')
    todoElementLI = event.target.parentNode.parentNode
    if (isChecked == null){
        event.target.setAttribute('checked', '')
        ToDoElementStorage.setItem(todoElementLI.querySelector('div label').innerText, true)
    } else {
        event.target.removeAttribute('checked', '')
        ToDoElementStorage.setItem(todoElementLI.querySelector('div label').innerText, false)
    }
    todoElementLI.classList.toggle('completed')
    selectedFilter.dispatchEvent(new Event('click'))
}