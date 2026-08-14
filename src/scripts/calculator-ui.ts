import type {
  BodyMeasurements,
  CalculatorValidationIssue,
} from '../lib/calculators';

export function formNumber(data: FormData, name: string): number {
  const raw = data.get(name);
  return typeof raw === 'string' && raw.trim() !== ''
    ? Number(raw)
    : Number.NaN;
}

export function readBodyMeasurements(data: FormData): BodyMeasurements {
  if (data.get('unitSystem') === 'imperial') {
    return {
      unitSystem: 'imperial',
      weightLb: formNumber(data, 'weightLb'),
      heightFeet: formNumber(data, 'heightFeet'),
      heightInches: formNumber(data, 'heightInches'),
    };
  }

  return {
    unitSystem: 'metric',
    weightKg: formNumber(data, 'weightKg'),
    heightCm: formNumber(data, 'heightCm'),
  };
}

export function setUnitPanels(
  form: HTMLFormElement,
  unit: 'metric' | 'imperial',
): void {
  form.querySelectorAll<HTMLElement>('[data-unit-panel]').forEach((panel) => {
    const active = panel.dataset.unitPanel === unit;
    panel.hidden = !active;
    panel.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
      input.disabled = !active;
    });
  });
}

export function initializeUnitControls(form: HTMLFormElement): void {
  let saved: 'metric' | 'imperial' = 'metric';
  try {
    saved =
      localStorage.getItem('wm-units') === 'imperial' ? 'imperial' : 'metric';
  } catch {
    // Metric remains the non-persistent default.
  }

  const radio = form.querySelector<HTMLInputElement>(
    `input[name="unitSystem"][value="${saved}"]`,
  );
  if (radio) radio.checked = true;
  setUnitPanels(form, saved);
  form
    .querySelectorAll<HTMLInputElement>('input[name="unitSystem"]')
    .forEach((input) => {
      input.addEventListener('change', () => {
        setUnitPanels(form, input.value as 'metric' | 'imperial');
      });
    });
}

export function rememberUnits(data: FormData): void {
  if (data.get('rememberUnits') !== 'on') return;
  try {
    localStorage.setItem(
      'wm-units',
      data.get('unitSystem') === 'imperial' ? 'imperial' : 'metric',
    );
  } catch {
    // Preferences are optional and calculator values are never stored.
  }
}

export function clearCalculatorErrors(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((node) => {
    node.textContent = '';
  });
  form
    .querySelectorAll<HTMLInputElement | HTMLSelectElement>('input, select')
    .forEach((control) => {
      control.removeAttribute('aria-invalid');
      control.removeAttribute('aria-describedby');
    });
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  if (summary) summary.hidden = true;
}

export function showCalculatorErrors(
  form: HTMLFormElement,
  issues: readonly CalculatorValidationIssue[],
): void {
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  const list = summary?.querySelector('ul');
  if (list) list.replaceChildren();

  issues.forEach((issue) => {
    const fieldName = issue.path.split('.').at(-1) ?? issue.path;
    const control = form.elements.namedItem(fieldName) as
      HTMLInputElement | HTMLSelectElement | null;
    const errorNode = form.querySelector<HTMLElement>(
      `[data-error-for="${fieldName}"]`,
    );

    if (control) {
      control.setAttribute('aria-invalid', 'true');
      if (errorNode?.id) control.setAttribute('aria-describedby', errorNode.id);
    }
    if (errorNode) errorNode.textContent = issue.message;

    const item = document.createElement('li');
    if (control?.id) {
      const link = document.createElement('a');
      link.href = `#${control.id}`;
      link.textContent = issue.message;
      item.append(link);
    } else {
      item.textContent = issue.message;
    }
    list?.append(item);
  });

  if (summary) {
    summary.hidden = false;
    summary.focus();
  }
}
