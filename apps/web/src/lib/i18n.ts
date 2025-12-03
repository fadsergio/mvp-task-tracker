import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
    en: {
        translation: {
            "nav": {
                "tasks": "Tasks",
                "users": "Employees",
                "clients": "Clients",
                "files": "Files",
                "reports": "Reports",
                "settings": "Settings",
                "profile": "Profile",
                "logout": "Logout",
                "login": "Login"
            },
            "tasks": {
                "title": "Tasks",
                "view_list": "List",
                "view_board": "Board",
                "view_calendar": "Calendar",
                "create": "Create Task",
                "search": "Search tasks...",
                "status": "Status",
                "priority": "Priority",
                "assignee": "Assignee",
                "due_date": "Due Date",
                "spent_time": "Hours",
                "project": "Project",
                "no_tasks": "No tasks found",
                "description": "Description",
                "edit": "Edit"
            },
            "status": {
                "NEW": "New",
                "IN_PROGRESS": "In Progress",
                "REVIEW": "Review",
                "DONE": "Done"
            },
            "priority": {
                "HIGH": "High",
                "MEDIUM": "Medium",
                "LOW": "Low"
            },
            "common": {
                "hours": "h",
                "save": "Save",
                "cancel": "Cancel",
                "delete": "Delete",
                "loading": "Loading...",
                "edit": "Edit",
                "create": "Create",
                "name": "Name",
                "description": "Description",
                "email": "Email",
                "phone": "Phone",
                "role": "Role",
                "upload_photo": "Upload Photo",
                "remove_photo": "Remove Photo",
                "required": "Required",
                "processing": "Processing...",
                "none": "None"
            },
            "users": {
                "title": "Employees",
                "subtitle": "Manage team and access.",
                "invite": "Invite Employee",
                "empty_title": "Team is empty",
                "empty_desc": "Invite colleagues to start collaborating.",
                "role_admin": "Admin",
                "role_manager": "Manager",
                "role_user": "User",
                "role_executor": "Executor",
                "modal_title_new": "Invite Employee",
                "modal_title_edit": "Edit Employee",
                "photo_profile": "Profile Photo"
            },
            "modals": {
                "task_new": "New Task",
                "task_edit": "Edit Task",
                "client_new": "New Client",
                "client_edit": "Edit Client",
                "error_save_client": "Error saving client",
                "placeholder_company": "Company LLC",
                "select_project": "Select Project",
                "select_assignees": "Select Assignees",
                "no_assignees": "No assignees available",
                "not_selected": "Not selected"
            },
            "reports": {
                "title": "Time Reports",
                "export_csv": "Export to CSV",
                "by_client": "By Client",
                "by_user": "By Employee",
                "date_from": "From Date",
                "date_to": "To Date",
                "no_data": "No data for selected period",
                "col_client": "Client",
                "col_user": "Employee",
                "col_total_hours": "Total Hours",
                "col_entries": "Entries Count"
            },
            "settings": {
                "title": "Settings",
                "subtitle": "Manage task display and preferences.",
                "view_modes": "Task View Modes",
                "view_modes_desc": "Choose which view modes will be available on the tasks page. At least one mode must be active.",
                "mode_list": "List Mode",
                "mode_list_desc": "Tasks are grouped by customizable blocks",
                "mode_kanban": "Kanban Mode",
                "mode_kanban_desc": "Tasks are displayed as columns by priority",
                "active": "Active",
                "list_settings": "List Mode Settings",
                "list_settings_desc": "These settings apply only to List mode",
                "layout_template": "Display Template",
                "layout_standard": "Standard",
                "layout_standard_desc": "Classic table or kanban board view.",
                "layout_split": "Focus (Split View)",
                "layout_split_desc": "Task list on the left, details on the right.",
                "layout_blocks": "By Blocks",
                "layout_blocks_desc": "Tasks grouped by priority.",
                "columns": "Columns Display",
                "col_priority": "Priority",
                "col_project": "Project",
                "col_participants": "Participants",
                "col_dueDate": "Due Date",
                "col_spentTime": "Time Spent",
                "task_blocks": "Task Blocks",
                "add_block": "Add Block",
                "block_name_placeholder": "Block Name",
                "color_blue": "Blue",
                "color_yellow": "Yellow",
                "color_green": "Green",
                "color_red": "Red",
                "color_purple": "Purple",
                "color_gray": "Gray"
            }
        }
    },
    ru: {
        translation: {
            "nav": {
                "tasks": "Задачи",
                "users": "Сотрудники",
                "clients": "Клиенты",
                "files": "Файлы",
                "reports": "Отчеты",
                "settings": "Настройки",
                "profile": "Профиль",
                "logout": "Выйти",
                "login": "Войти"
            },
            "tasks": {
                "title": "Задачи",
                "subtitle": "Управление задачами и проектами.",
                "view_list": "Список",
                "view_board": "Доска",
                "view_calendar": "Календарь",
                "create": "Создать задачу",
                "search": "Поиск задач...",
                "priority": "Приоритет",
                "assignee": "Исполнитель",
                "due_date": "Срок",
                "spent_time": "Часы",
                "project": "Проект",
                "no_tasks": "Задач не найдено",
                "description": "Описание",
                "edit": "Редактировать"
            },
            "priority": {
                "HIGH": "Высокий",
                "MEDIUM": "Средний",
                "LOW": "Низкий"
            },
            "common": {
                "hours": "ч",
                "save": "Сохранить",
                "cancel": "Отмена",
                "delete": "Удалить",
                "loading": "Загрузка...",
                "edit": "Редактировать",
                "create": "Создать",
                "name": "Название",
                "description": "Описание",
                "email": "Email",
                "phone": "Телефон",
                "role": "Роль",
                "upload_photo": "Загрузить фото",
                "remove_photo": "Удалить фото",
                "required": "Обязательно",
                "processing": "Обработка...",
                "none": "Нет"
            },
            "users": {
                "title": "Сотрудники",
                "subtitle": "Управление командой и доступом.",
                "invite": "Пригласить сотрудника",
                "empty_title": "Команда пуста",
                "empty_desc": "Пригласите коллег, чтобы начать совместную работу.",
                "role_admin": "Администратор",
                "role_manager": "Менеджер",
                "role_user": "Пользователь",
                "role_executor": "Исполнитель",
                "modal_title_new": "Пригласить сотрудника",
                "modal_title_edit": "Редактировать сотрудника",
                "photo_profile": "Фото профиля"
            },
            "modals": {
                "task_new": "Новая задача",
                "task_edit": "Редактировать задачу",
                "client_new": "Новый клиент",
                "client_edit": "Редактировать клиента",
                "error_save_client": "Ошибка сохранения клиента",
                "placeholder_company": "ООО Компания",
                "select_project": "Выберите проект",
                "select_assignees": "Выберите участников",
                "no_assignees": "Нет доступных участников",
                "not_selected": "Не выбран"
            },
            "reports": {
                "title": "Отчеты по времени",
                "export_csv": "Экспорт в CSV",
                "by_client": "По клиентам",
                "by_user": "По сотрудникам",
                "date_from": "С даты",
                "date_to": "По дату",
                "no_data": "Нет данных за выбранный период",
                "col_client": "Клиент",
                "col_user": "Сотрудник",
                "col_total_hours": "Всего часов",
                "col_entries": "Количество записей"
            },
            "settings": {
                "title": "Настройки",
                "subtitle": "Управление отображением задач.",
                "view_modes": "Режимы отображения задач",
                "view_modes_desc": "Выберите, какие режимы отображения будут доступны на странице задач. Должен быть активен хотя бы один режим.",
                "mode_list": "Режим \"Список\"",
                "mode_list_desc": "Задачи группируются по настраиваемым блокам",
                "mode_kanban": "Режим \"Канбан\"",
                "mode_kanban_desc": "Задачи отображаются в виде колонок по приоритету",
                "active": "Активен",
                "list_settings": "Настройки режима \"Список\"",
                "list_settings_desc": "Эти настройки применяются только в режиме \"Список\"",
                "layout_template": "Шаблон отображения",
                "layout_standard": "Стандартный",
                "layout_standard_desc": "Классический вид таблицы или канбан-доски.",
                "layout_split": "Фокус (Split View)",
                "layout_split_desc": "Список задач слева, детали выбранной задачи справа.",
                "layout_blocks": "По блокам",
                "layout_blocks_desc": "Задачи сгруппированы по приоритету.",
                "columns": "Отображение колонок",
                "col_priority": "Приоритет",
                "col_project": "Проект",
                "col_participants": "Участники",
                "col_dueDate": "Срок",
                "col_spentTime": "Затрачено времени",
                "task_blocks": "Блоки задач",
                "add_block": "Добавить блок",
                "block_name_placeholder": "Название блока",
                "color_blue": "Синий",
                "color_yellow": "Желтый",
                "color_green": "Зеленый",
                "color_red": "Красный",
                "color_purple": "Фиолетовый",
                "color_gray": "Серый"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        lng: 'ru', // Force Russian language
        fallbackLng: 'ru',
        interpolation: {
            escapeValue: false // react already safes from xss
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
