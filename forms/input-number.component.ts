import { Input, Output, Component, EventEmitter } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'input-number',
    templateUrl: './input-number.component.html',
})
export class InputNumberComponent {
    @Input() public value: any;
    @Input() public format: string;
    @Input() public leftIcon: any;
    @Output() public update: EventEmitter<any> = new EventEmitter<any>();

    public formattedValue: any;
    public hasError: boolean = false;

    constructor(private decimalPipe: DecimalPipe) { }

    ngOnInit() {
        this.formattedValue = this.formatValue(this.value);
    }

    onFocus(): void {
        this.formattedValue = this.value;
    }

    onBlur(rawValue: any): void {
        this.formattedValue = this.formatValue(rawValue);

        const numericValueIfValid = this.hasError ? rawValue : +rawValue;
        this.update.emit(numericValueIfValid);
    }

    formatValue(rawValue: any): any {
        try {
            var formattedValue = this.decimalPipe.transform(rawValue, this.format);
            this.hasError = false;
            return formattedValue;
        } catch (e) {
            console.debug('Value could not be formatted with decimal pipe.',
                'Value:', rawValue,
                'Format:', this.format,
                'Pipe:', this.decimalPipe);
            this.hasError = true;
            return rawValue;
        }
    }


    showGlyphChar(): boolean {
        return this.leftIcon && !this.showGlyphIcon();
    }

    showGlyphIcon(): boolean {
        return this.leftIcon && this.leftIcon.indexOf('glyphicon-') >= 0;
    }
}
