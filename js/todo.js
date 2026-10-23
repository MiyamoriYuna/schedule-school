
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("todoForm");
  const titleInput = document.getElementById("todoTitle");
  const categoryInput = document.getElementById("todoCategory");
  const subjectInput = document.getElementById("todoSubject");
  const dueDateInput = document.getElementById("todoDueDate");
  const memoInput = document.getElementById("todoMemo");

  const todoList = document.getElementById("todoList");
  const completedTodoList = document.getElementById("completedTodoList");
  const message = document.getElementById("todoMessage");
  const addButton = document.getElementById("addTodoButton");

  let editingId = null;
  let todos = [];

  // 登録済みの教科を選択肢に追加
  try {
    const subjects = await getSubjects();

    subjects.forEach(subject => {
      const option = document.createElement("option");
      option.value = subject.id;
      option.textContent =
        subject.name || subject.subject || subject.title || "名称未設定";

      subjectInput.appendChild(option);
    });
  } catch (error) {
    console.error("教科の読み込みに失敗しました", error);
  }

  // やることを読み込む
  async function loadTodos() {
    try {
      todos = await getTodos();

      // 期限が近いものを先に表示。期限なしは後ろへ
      todos.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return a.dueDate.localeCompare(b.dueDate);
      });

      renderTodos();
    } catch (error) {
      console.error(error);
      message.textContent = "やることを読み込めませんでした。";
    }
  }

  // 画面に表示
  function renderTodos() {
    todoList.replaceChildren();
    completedTodoList.replaceChildren();

    const incomplete = todos.filter(todo => !todo.completed);
    const completed = todos.filter(todo => todo.completed);

    renderGroup(incomplete, todoList, "未登録のやることはありません。");
    renderGroup(completed, completedTodoList, "完了したやることはありません。");
  }

  function renderGroup(items, container, emptyText) {
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "todo-empty";
      empty.textContent = emptyText;
      container.appendChild(empty);
      return;
    }

    items.forEach(todo => {
      const item = document.createElement("article");
      item.className = "todo-item";

      const top = document.createElement("div");
      top.className = "todo-item-top";

      const checkLabel = document.createElement("label");
      checkLabel.className = "todo-check";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(todo.completed);
      checkbox.setAttribute("aria-label", `${todo.title}を完了にする`);

      checkbox.addEventListener("change", async () => {
        try {
          await saveTodo({
            ...todo,
            completed: checkbox.checked
          });

          message.textContent = checkbox.checked
            ? "完了にしました。"
            : "未完了に戻しました。";

          await loadTodos();
        } catch (error) {
          console.error(error);
          checkbox.checked = !checkbox.checked;
          message.textContent = "状態を保存できませんでした。";
        }
      });

      const title = document.createElement("span");
      title.className = "todo-item-title";
      title.textContent = todo.title;

      if (todo.completed) {
        title.classList.add("is-completed");
      }

      checkLabel.append(checkbox, title);
      top.appendChild(checkLabel);
      item.appendChild(top);

      const details = document.createElement("div");
      details.className = "todo-details";

      const category = document.createElement("span");
      category.className = "todo-tag";
      category.textContent = todo.category || "その他";
      details.appendChild(category);

      if (todo.subjectName) {
        const subject = document.createElement("span");
        subject.className = "todo-tag";
        subject.textContent = todo.subjectName;
        details.appendChild(subject);
      }

      if (todo.dueDate) {
        const dueDate = document.createElement("span");
        dueDate.className = "todo-due-date";
        dueDate.textContent = `期限：${todo.dueDate}`;
        details.appendChild(dueDate);
      }

      item.appendChild(details);

      if (todo.memo) {
        const memo = document.createElement("p");
        memo.className = "todo-memo";
        memo.textContent = todo.memo;
        item.appendChild(memo);
      }

      const actions = document.createElement("div");
      actions.className = "todo-actions";

      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "todo-edit-button";
      editButton.textContent = "編集";

      editButton.addEventListener("click", () => {
        editingId = todo.id;
        titleInput.value = todo.title;
        categoryInput.value = todo.category || "その他";
        subjectInput.value = todo.subjectId || "";
        dueDateInput.value = todo.dueDate || "";
        memoInput.value = todo.memo || "";

        addButton.textContent = "変更を保存";
        message.textContent = "内容を編集しています。";

        form.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        titleInput.focus();
      });

      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "todo-delete-button";
      deleteButton.textContent = "削除";

      deleteButton.addEventListener("click", async () => {
        if (!confirm(`「${todo.title}」を削除しますか？`)) {
          return;
        }

        try {
          await deleteTodo(todo.id);

          if (editingId === todo.id) {
            resetForm();
          }

          message.textContent = "削除しました。";
          await loadTodos();
        } catch (error) {
          console.error(error);
          message.textContent = "削除できませんでした。";
        }
      });

      actions.append(editButton, deleteButton);
      item.appendChild(actions);
      container.appendChild(item);
    });
  }

  // 入力欄を初期状態に戻す
  function resetForm() {
    form.reset();
    editingId = null;
    addButton.textContent = "やることを追加";

    const cancelButton = document.getElementById("cancelTodoEdit");
    if (cancelButton) {
      cancelButton.remove();
    }
  }

  // 編集中のキャンセルボタンを表示
  function showCancelButton() {
    if (document.getElementById("cancelTodoEdit")) return;

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.id = "cancelTodoEdit";
    cancelButton.className = "todo-cancel-button";
    cancelButton.textContent = "編集をキャンセル";

    cancelButton.addEventListener("click", () => {
      resetForm();
      message.textContent = "";
    });

    addButton.insertAdjacentElement("afterend", cancelButton);
  }

  // 編集ボタンを押したとき、キャンセルも可能にする
  const originalRenderTodos = renderTodos;

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const title = titleInput.value.trim();

    if (!title) {
      message.textContent = "やることを入力してください。";
      return;
    }

    const selectedSubject = subjectInput.selectedOptions[0];

    const existing = editingId
      ? todos.find(todo => todo.id === editingId)
      : null;

    const todo = {
      id: editingId || `todo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category: categoryInput.value,
      subjectId: subjectInput.value,
      subjectName: subjectInput.value
        ? selectedSubject.textContent
        : "",
      dueDate: dueDateInput.value,
      memo: memoInput.value.trim(),
      completed: existing ? Boolean(existing.completed) : false,
      createdAt: existing ? existing.createdAt : Date.now()
    };

    addButton.disabled = true;

    try {
      await saveTodo(todo);

      message.textContent = editingId
        ? "変更を保存しました。"
        : "やることを追加しました。";

      resetForm();
      await loadTodos();
    } catch (error) {
      console.error(error);
      message.textContent = "保存できませんでした。";
    } finally {
      addButton.disabled = false;
    }
  });

  // 編集開始時にキャンセルボタンを追加
  todoList.addEventListener("click", event => {
    if (event.target.closest(".todo-edit-button")) {
      showCancelButton();
    }
  });

  completedTodoList.addEventListener("click", event => {
    if (event.target.closest(".todo-edit-button")) {
      showCancelButton();
    }
  });

  await loadTodos();
});
