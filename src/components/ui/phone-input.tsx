import { CheckIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import * as RPNInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Input, InputProps } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { ScrollArea } from "./scroll-area";

type PhoneInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> &
  Omit<RPNInput.Props<typeof RPNInput.default>, "onChange" | "value"> & {
    onChange?: (value: RPNInput.Value) => void;
    value?: RPNInput.Value;
  };

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
    ({ className, onChange, value, ...props }, ref) => {
      return (
        <RPNInput.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          // Lock to Australia only
          defaultCountry="AU"
          country="AU"
          // Force international format to ensure +61 prefix
          international={true}
          // Disable country selection
          countrySelectProps={{ disabled: true }}
          // Pass the value directly
          value={value}
          /**
           * Handles the onChange event.
           * 
           * UX considerations:
           * - Locked to Australian numbers only
           * - Always shows +61 prefix
           * - Proper formatting for Australian mobile/landline numbers
           *
           * @param {E164Number | undefined} value - The entered value
           */
          onChange={(value: RPNInput.Value) => {
            onChange?.(value);
          }}
          placeholder="+61 4XX XXX XXX"
          {...props}
        />
      );
    }
  );
PhoneInput.displayName = "PhoneInput";

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, onChange, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      const cursorPos = input.selectionStart || 0;
      
      // Prevent deletion of "+61 " prefix
      if (e.key === 'Backspace' && cursorPos <= 4) {
        e.preventDefault();
        return;
      }
      
      // Call original onKeyDown if exists
      onKeyDown?.(e);
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.currentTarget;
      let value = input.value;
      
      // Ensure the value always starts with "+61 "
      if (!value.startsWith('+61 ')) {
        // If user tries to paste or type something that doesn't start with +61
        if (!value.startsWith('+61')) {
          value = '+61 ' + value.replace(/^\+?61?\s*/, '');
        } else if (value === '+61') {
          value = '+61 ';
        }
        input.value = value;
      }
      
      // Call original onChange if exists
      onChange?.(e);
    };
    
    return (
      <Input
        className={cn("rounded-e-md rounded-s-none h-10", className)}
        {...props}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        ref={ref}
      />
    );
  }
);
InputComponent.displayName = "InputComponent";

type CountrySelectOption = { label: string; value: RPNInput.Country };

type CountrySelectProps = {
  disabled?: boolean;
  value: RPNInput.Country;
  onChange: (value: RPNInput.Country) => void;
  options: CountrySelectOption[];
};

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNInput.Country) => {
      onChange(country);
    },
    [onChange]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant={"outline"}
          className={cn(
            "flex gap-1 rounded-e-none rounded-s-md px-3 h-10 border border-theme-border bg-theme-card/50",
            disabled && "cursor-not-allowed opacity-60"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn("-mr-2 h-4 w-4 opacity-50", disabled && "hidden")}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandList>
            <ScrollArea className="h-72">
              <CommandInput placeholder="Search country..." />
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {options
                  .filter((x) => x.value)
                  .map((option) => (
                    <CommandItem
                      className="gap-2"
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <FlagComponent
                        country={option.value}
                        countryName={option.label}
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {option.value && (
                        <span className="text-foreground/50 text-sm">
                          {`+${RPNInput.getCountryCallingCode(option.value)}`}
                        </span>
                      )}
                      <CheckIcon
                        className={cn(
                          "ml-auto h-4 w-4",
                          option.value === value ? "opacity-100" : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country] || flags["AU"];

  return (
    <span className="bg-foreground/20 flex h-4 w-6 overflow-hidden rounded-sm">
      {Flag && <Flag title={countryName} />}
    </span>
  );
};
FlagComponent.displayName = "FlagComponent";

export { PhoneInput };
