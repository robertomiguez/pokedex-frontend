import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import DatePicker from '../../src/components/ui/DatePicker.vue';

describe('DatePicker.vue', () => {
    it('renders the input with placeholder', () => {
        const wrapper = mount(DatePicker, {
            props: { modelValue: '' }
        });
        const input = wrapper.find('input');
        expect(input.attributes('placeholder')).toBe('YYYY-MM-DD');
    });

    it('opens calendar on click', async () => {
        const wrapper = mount(DatePicker, {
            props: { modelValue: '' }
        });
        expect(wrapper.find('.calendar-popup').exists()).toBe(false);

        await wrapper.find('.input-wrapper').trigger('click');
        expect(wrapper.find('.calendar-popup').exists()).toBe(true);
    });

    it('displays the correct month and year', async () => {
        const wrapper = mount(DatePicker, {
            props: { modelValue: '2023-10-15' }
        });
        await wrapper.find('.input-wrapper').trigger('click');

        expect(wrapper.find('.month-year').text()).toContain('October 2023');
    });

    it('emits update:modelValue when a valid date is clicked', async () => {
        // Mock date to ensure consistent testing environment
        const wrapper = mount(DatePicker, {
            props: { modelValue: '2023-10-01' }
        });
        await wrapper.find('.input-wrapper').trigger('click');

        const days = wrapper.findAll('.calendar-cell');
        const targetDay = days.find(d => d.text() === '15' && !d.classes('empty'));

        await targetDay?.trigger('click');

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['2023-10-15']);
    });

    it('disables future dates', async () => {
        // Use a date far in the future
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const y = futureDate.getFullYear();
        const m = String(futureDate.getMonth() + 1).padStart(2, '0');
        const dStr = `25`; // Arbitrary day

        // Initialize component with that future month to ensure it renders
        const wrapper = mount(DatePicker, {
            props: { modelValue: `${y}-${m}-01` }
        });

        await wrapper.find('.input-wrapper').trigger('click');

        const days = wrapper.findAll('.calendar-cell');
        const futureCell = days.find(d => d.text() === dStr && !d.classes('empty'));

        expect(futureCell?.classes()).toContain('disabled');

        await futureCell?.trigger('click');
        const emits = wrapper.emitted('update:modelValue');
        expect(emits).toBeUndefined();
    });
});
