/* Simple Todo app with localStorage persistence
   Features:
   - Add, edit, delete todos
   - Toggle complete
   - Filters: all / active / completed
   - Search
   - Clear completed
   - Persistence using localStorage (key: 'todos-v1')
*/

const STORAGE_KEY = 'todos-v1'

const elements = {
  form: document.getElementById('todo-form'),
  input: document.getElementById('new-todo'),
  list: document.getElementById('todo-list'),
  count: document.getElementById('todo-count'),
  filters: document.querySelectorAll('.filter'),
  search: document.getElementById('search'),
  clearCompleted: document.getElementById('clear-completed')
}

let todos = []
let filter = 'all'
let searchQuery = ''

/* utilities */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,6)
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    todos = raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to parse todos from storage', e)
    todos = []
  }
}

/* CRUD */
function addTodo(text){
  if(!text || !text.trim()) return
  const item = {
    id: uid(),
    text: text.trim(),
    completed: false,
    createdAt: new Date().toISOString()
  }
  todos.unshift(item)
  save()
  render()
}

function updateTodo(id, newData){
  const idx = todos.findIndex(t => t.id === id)
  if(idx === -1) return
  todos[idx] = {...todos[idx], ...newData}
  save()
  render()
}

function removeTodo(id){
  todos = todos.filter(t => t.id !== id)
  save()
  render()
}

function clearCompleted(){
  todos = todos.filter(t => !t.completed)
  save()
  render()
}

/* rendering */
function render(){
  // Apply filter and search
  const filtered = todos.filter(t => {
    if(filter === 'active' && t.completed) return false
    if(filter === 'completed' && !t.completed) return false
    if(searchQuery && !t.text.toLowerCase().includes(searchQuery)) return false
    return true
  })

  elements.list.innerHTML = ''
  if(filtered.length === 0){
    const empty = document.createElement('li')
    empty.className = 'todo-item'
    empty.innerHTML = `<div class="todo-content"><div class="todo-text" style="color:var(--muted)">No items</div></div>`
    elements.list.appendChild(empty)
  } else {
    for(const t of filtered){
      const li = document.createElement('li')
      li.className = 'todo-item'
      li.dataset.id = t.id

      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = !!t.completed
      checkbox.setAttribute('aria-label', `Mark ${t.text} completed`)
      checkbox.addEventListener('change', ()=> updateTodo(t.id, {completed: checkbox.checked}))

      const content = document.createElement('div')
      content.className = 'todo-content'

      const text = document.createElement('div')
      text.className = 'todo-text' + (t.completed ? ' completed' : '')
      text.textContent = t.text
      text.title = 'Double-click to edit'
      text.addEventListener('dblclick', () => editTodoPrompt(t.id))

      const meta = document.createElement('div')
      meta.className = 'todo-meta'
      const created = new Date(t.createdAt)
      meta.textContent = `Added ${created.toLocaleString()}`

      content.appendChild(text)
      content.appendChild(meta)

      const actions = document.createElement('div')
      actions.className = 'todo-actions'

      const editBtn = document.createElement('button')
      editBtn.className = 'icon-btn edit'
      editBtn.innerHTML = 'Edit'
      editBtn.addEventListener('click', ()=> editTodoPrompt(t.id))

      const delBtn = document.createElement('button')
      delBtn.className = 'icon-btn delete'
      delBtn.innerHTML = 'Delete'
      delBtn.addEventListener('click', ()=> {
        if(confirm('Delete this todo?')) removeTodo(t.id)
      })

      actions.appendChild(editBtn)
      actions.appendChild(delBtn)

      li.appendChild(checkbox)
      li.appendChild(content)
      li.appendChild(actions)

      elements.list.appendChild(li)
    }
  }

  // update count
  const remaining = todos.filter(t => !t.completed).length
  elements.count.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`
}

/* edit by prompt (simple cross-browser) */
function editTodoPrompt(id){
  const t = todos.find(x => x.id === id)
  if(!t) return
  const newText = prompt('Edit todo', t.text)
  if(newText === null) return // cancelled
  const trimmed = newText.trim()
  if(!trimmed){
    if(confirm('Empty text — delete this todo?')) removeTodo(id)
    return
  }
  updateTodo(id, {text: trimmed})
}

/* events */
elements.form.addEventListener('submit', (e) => {
  e.preventDefault()
  addTodo(elements.input.value)
  elements.input.value = ''
  elements.input.focus()
})

elements.input.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') elements.input.value = ''
})

elements.filters.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.filters.forEach(b=>b.classList.remove('active'))
    btn.classList.add('active')
    filter = btn.dataset.filter
    render()
  })
})

elements.search.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim().toLowerCase()
  render()
})

elements.clearCompleted.addEventListener('click', () => {
  if(confirm('Remove all completed todos?')) clearCompleted()
})

/* initialize */
load()
render()
