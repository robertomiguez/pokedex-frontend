<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
  label?: string;
  placeholder?: string;
  maxDate?: string;
  minDate?: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const isVisible = ref(false);
const containerRef = ref<HTMLElement | null>(null);

// Calendar State
const currentMonth = ref(new Date().getMonth());
const currentYear = ref(new Date().getFullYear());

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Helpers
const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

type CalendarCell = 
  | { type: 'empty'; id: string; value?: undefined; date?: undefined; isSelected?: undefined; isToday?: undefined; isFuture?: undefined }
  | { type: 'day'; id: string; value: number; date: string; isSelected: boolean; isToday: boolean; isFuture: boolean };

// Computed Calendar Grid
const calendarDays = computed<CalendarCell[]>(() => {
  const daysInMonth = getDaysInMonth(currentMonth.value, currentYear.value);
  const firstDay = getFirstDayOfMonth(currentMonth.value, currentYear.value);
  
  const days: CalendarCell[] = [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Previous month padding
  for (let i = 0; i < firstDay; i++) {
    days.push({ type: 'empty', id: `prev-${i}` });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = formatDateStr(currentYear.value, currentMonth.value, i);
    const cellDate = new Date(currentYear.value, currentMonth.value, i);
    
    days.push({
      type: 'day',
      value: i,
      date: dateStr,
      id: `day-${i}`,
      isSelected: dateStr === props.modelValue,
      isToday: dateStr === formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
      isFuture: cellDate > today
    });
  }
  
  return days;
});

function formatDateStr(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

// Actions
function toggleCalendar() {
  isVisible.value = !isVisible.value;
  if (isVisible.value && props.modelValue) {
      // Sync calendar view to selected date if exists
      const d = new Date(props.modelValue);
      if (!isNaN(d.getTime())) {
          currentMonth.value = d.getUTCMonth();
          currentYear.value = d.getUTCFullYear();
      }
  }
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
}

function selectDate(cell: CalendarCell) {
  if (cell.type === 'day' && !cell.isFuture && cell.date) {
    emit('update:modelValue', cell.date);
    isVisible.value = false;
  }
}

function clearDate(e: Event) {
    e.stopPropagation();
    emit('update:modelValue', '');
}

// Click Outside
function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isVisible.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

const displayValue = computed(() => {
    return props.modelValue ? props.modelValue : '';
});

</script>

<template>
  <div class="date-picker-container" ref="containerRef">
    <label v-if="label" class="picker-label">{{ label }}</label>
    <div class="input-wrapper" @click="toggleCalendar">
      <input 
        type="text" 
        readonly 
        :value="displayValue" 
        :placeholder="placeholder || 'YYYY-MM-DD'"
        class="picker-input"
      />
      <span class="calendar-icon">📅</span>
      <span v-if="modelValue" class="clear-icon" @click="clearDate">✕</span>
    </div>

    <div v-if="isVisible" class="calendar-popup">
      <div class="calendar-header">
        <button @click.stop="prevMonth" class="nav-btn">&lt;</button>
        <div class="month-year">{{ months[currentMonth] }} {{ currentYear }}</div>
        <button @click.stop="nextMonth" class="nav-btn">&gt;</button>
      </div>

      <div class="calendar-weekdays">
        <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="calendar-grid">
        <div 
          v-for="cell in calendarDays" 
          :key="cell.id"
          class="calendar-cell"
          :class="{ 
            'empty': cell.type === 'empty',
            'selected': cell.type === 'day' && cell.isSelected,
            'today': cell.type === 'day' && cell.isToday,
            'disabled': cell.type === 'day' && cell.isFuture
          }"
          @click="selectDate(cell)"
        >
          {{ cell.type === 'day' ? cell.value : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker-container {
  position: relative;
  font-family: 'Inter', sans-serif;
}

.picker-label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #666;
}

.input-wrapper {
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.picker-input {
  width: 100%;
  padding: 0 2rem 0 0.8rem;
  height: 36px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  color: #333;
  cursor: pointer;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.picker-input:focus {
    outline: 2px solid #646cff;
    border-color: #646cff;
}

.calendar-icon {
  position: absolute;
  right: 8px;
  pointer-events: none;
  font-size: 1rem;
  opacity: 0.6;
}

.clear-icon {
    position: absolute;
    right: 30px;
    font-size: 0.8rem;
    color: #999;
    padding: 2px 5px;
    border-radius: 50%;
}
.clear-icon:hover {
    background: #eee;
    color: #666;
}

/* Popup */
.calendar-popup {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  padding: 1rem;
  z-index: 1000;
  width: 260px;
  user-select: none;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.month-year {
  font-weight: 600;
  color: #333;
}

.nav-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: #666;
  border-radius: 4px;
}

.nav-btn:hover {
  background: #f0f0f0;
}

/* Grid */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 0.5rem;
  text-align: center;
}

.weekday {
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.calendar-cell {
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  border-radius: 4px;
  cursor: pointer;
  color: #333;
}

.calendar-cell:hover:not(.empty):not(.disabled) {
  background-color: #f0f0f0;
}

.calendar-cell.selected {
  background-color: #646cff;
  color: white;
}

.calendar-cell.today {
  border: 1px solid #646cff;
  font-weight: bold;
}

.calendar-cell.disabled {
    color: #ccc;
    cursor: not-allowed;
    pointer-events: none;
}

.calendar-cell.empty {
  cursor: default;
}
</style>