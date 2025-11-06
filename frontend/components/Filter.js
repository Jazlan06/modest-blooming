import { useState, useEffect } from 'react';
import { FaFilter } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Select from 'react-select';

const Filter = ({ filterOptions }) => {
    const [category, setCategory] = useState([]);
    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);
    const [tags, setTags] = useState('');
    const [filteredTags, setFilteredTags] = useState([]);
    const [colors, setColors] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [inStock, setInStock] = useState('');
    const [bestSelling, setBestSelling] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    //was working for /products
    const updateFilters = () => {
        const filterParams = new URLSearchParams(router.query);

        if (category && category.length) filterParams.set('category', category.join(','));
        else filterParams.delete('category');

        if (minPrice) filterParams.set('minPrice', minPrice);
        else filterParams.delete('minPrice');

        if (maxPrice) filterParams.set('maxPrice', maxPrice);
        else filterParams.delete('maxPrice');

        if (tags) filterParams.set('tags', tags);
        else filterParams.delete('tags');

        if (selectedColors.length) filterParams.set('colors', selectedColors.join(','));
        else filterParams.delete('colors');

        if (inStock) filterParams.set('inStock', inStock);
        else filterParams.delete('inStock');

        if (bestSelling) filterParams.set('bestSelling', bestSelling);
        else filterParams.delete('bestSelling');

        // Always reset to page 1 on filter change
        filterParams.set('page', 1);

        router.push({
            pathname: router.pathname,
            query: Object.fromEntries(filterParams.entries()),
        });
    };

    const handleTagSearch = (event) => {
        const searchQuery = event.target.value;
        setTags(searchQuery);
        const formattedTags = searchQuery.trim();

        if (filterOptions?.allProducts) {
            const matchingTags = filterOptions.allProducts
                .filter(product => {
                    return (
                        product.tags.some(tag => tag.toLowerCase().includes(formattedTags.toLowerCase())) ||
                        product.name.toLowerCase().includes(formattedTags.toLowerCase()) ||
                        product.description.toLowerCase().includes(formattedTags.toLowerCase())
                    );
                })
                .map(product => product.tags)
                .flat()
                .filter((value, index, self) => self.indexOf(value) === index);
            setFilteredTags(matchingTags);
        }

        if (formattedTags) {
            router.push({
                pathname: router.pathname,
                query: { ...router.query, tags: formattedTags, page: 1 },
            });
        } else {
            const newQuery = { ...router.query };
            delete newQuery.tags;
            router.push({
                pathname: router.pathname,
                query: newQuery,
            });
        }

    };

    const handleColorChange = (color) => {
        setSelectedColors((prevColors) =>
            prevColors.includes(color)
                ? prevColors.filter((c) => c !== color)
                : [...prevColors, color]
        );
    };

    useEffect(() => {
        setMinPrice(filterOptions?.priceRange?.min ?? 0);
        setMaxPrice(filterOptions?.priceRange?.max ?? 3000);
        setColors(filterOptions?.colors || []);
    }, [filterOptions]);

    // Custom styles for react-select
    const customSelectStyles = {
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        control: (base) => ({
            ...base,
            borderRadius: '8px',
            borderColor: '#ddd',
            boxShadow: 'none',
            '&:hover': { borderColor: '#aaa' },
            minHeight: '40px',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#f0f0f0',
            borderRadius: '6px',
            padding: '2px 4px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#333',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#e5f0ff' : '#fff',
            color: state.isSelected ? '#fff' : '#333',
        }),
    };

    return (
        <>
            {/* Filter Icon */}
            <div
                className="absolute top-24 right-4 md:top-[9rem] md:right-[15rem] flex items-center space-x-2 cursor-pointer z-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <FaFilter size={24} className="text-gray-400" />
                <span className="font-heading text-gray-400 text-lg">Filter</span>
            </div>

            {/* Sidebar */}
            {isOpen && (
                <div className="filter-sidebar fixed top-[70px] md:top-[9rem] right-0 w-80 bg-white p-6 shadow-2xl z-50 rounded-l-lg">
                    <button
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
                        onClick={() => setIsOpen(false)}
                    >✕</button>
                    <h2 className="text-xl font-bold font-heading mb-6 border-b pb-2">Filters</h2>

                    {/* Category Filter */}
                    <div className="filter-item mb-6">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                        <Select
                            isMulti
                            options={filterOptions?.categories?.map(cat => ({ value: cat.name, label: `${cat.name} (${cat.count})` }))}
                            value={(category || []).map(cat => ({ value: cat, label: cat }))}
                            onChange={(selected) => setCategory(selected.map(option => option.value))}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            styles={customSelectStyles}
                        />
                    </div>

                    {/* Price Range */}
                    <div className="filter-item mb-6">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Price Range</label>
                        <div className="flex justify-between text-sm mb-2">
                            <span>₹{minPrice}</span>
                            <span>₹{maxPrice}</span>
                        </div>
                        <div className="relative w-full h-6">
                            <input
                                type="range"
                                min="0"
                                max="3000"
                                value={minPrice}
                                onChange={(e) => { const val = Number(e.target.value); if (val <= maxPrice) setMinPrice(val); }}
                                className="absolute w-full h-2 bg-blue-400 rounded z-20"
                            />
                            <input
                                type="range"
                                min="0"
                                max="3000"
                                value={maxPrice}
                                onChange={(e) => { const val = Number(e.target.value); if (val >= minPrice) setMaxPrice(val); }}
                                className="absolute w-full h-2 bg-blue-400 rounded z-30"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="filter-item mb-6">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Tags</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={handleTagSearch}
                            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-1 focus:ring-blue-400 focus:outline-none"
                            placeholder="Search tags, product names, or descriptions"
                        />
                        {filteredTags.length > 0 && (
                            <ul className="mt-2 max-h-32 overflow-auto border border-gray-200 rounded-lg">
                                {filteredTags.map((tag, index) => (
                                    <li
                                        key={index}
                                        className="cursor-pointer text-sm p-2 hover:bg-blue-50"
                                        onClick={() => setTags(tag)}
                                    >
                                        {tag}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Colors Dropdown */}
                    <div className="filter-item mb-6">
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Colors</label>
                        <Select
                            isMulti
                            options={colors?.map(c => ({ value: c.color, label: `${c.color} (${c.count})` }))}
                            value={selectedColors.map(c => ({ value: c, label: c }))}
                            onChange={(selected) => setSelectedColors(selected.map(option => option.value))}
                            menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                            menuPosition="fixed"
                            styles={{
                                ...customSelectStyles,
                                multiValue: (base, state) => ({
                                    ...base,
                                    backgroundColor: state.data.value,
                                    color: '#fff',
                                }),
                            }}
                        />
                    </div>

                    {/* In Stock */}
                    <div className="filter-item mb-4 flex items-center">
                        <input
                            type="checkbox"
                            checked={inStock === 'true'}
                            onChange={() => setInStock(inStock === 'true' ? '' : 'true')}
                            className="mr-2"
                        />
                        <label className="text-sm font-medium">In Stock</label>
                    </div>

                    {/* Best Selling */}
                    <div className="filter-item mb-6 flex items-center">
                        <input
                            type="checkbox"
                            checked={bestSelling === 'true'}
                            onChange={() => setBestSelling(bestSelling === 'true' ? '' : 'true')}
                            className="mr-2"
                        />
                        <label className="text-sm font-medium">Best Selling</label>
                    </div>

                    <button
                        onClick={() => {
                            updateFilters();
                            setIsOpen(false);
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition"
                    >
                        Apply Filters
                    </button>

                </div>
            )}
        </>
    );
};

export default Filter;