import {Autocomplete, Icon} from '@shopify/polaris';
import {SearchMinor} from '@shopify/polaris-icons';
import {useState, useCallback, useMemo} from 'react';

function SearchBar({options: collectionOptions, onChange}) {

const deselectedOptions = useMemo(
    () => collectionOptions,
    [],
);

const [selectedOptions, setSelectedOptions] = useState([]);
const [inputValue, setInputValue] = useState('');
const [options, setOptions] = useState(deselectedOptions);

const updateText = useCallback(
    (value) => {
    const maxLength = 255; 
    setInputValue(value);
    if (value === '') {
        setOptions(deselectedOptions);
        return;
    }
    
    const filterRegex = new RegExp(`^(?!\\s|\\n)[\\s\\S]{1,${maxLength}}$`, 'g');
        const resultOptions = deselectedOptions.filter((option) =>
        option.label.match(filterRegex),
    );
    setOptions(resultOptions);
    },
    [deselectedOptions],
);

const updateSelection = useCallback(
    (selected) => {
        onChange(selected[0])
    setSelectedOptions(selected);
    setInputValue(selected[0]);
    },
    [options],
);
const textField = (
    <Autocomplete.TextField
    onChange={updateText}
    label="Search for a collection"
    value={inputValue}
    prefix={<Icon source={SearchMinor} color="base" />}
    placeholder="Search"
    autoComplete="off"
    />
);

return (
    <div style={{height: '65px'}}>
    <Autocomplete
        options={options}
        selected={selectedOptions}
        onSelect={updateSelection}
        textField={textField}
    />
    </div>
);
}

export default SearchBar;