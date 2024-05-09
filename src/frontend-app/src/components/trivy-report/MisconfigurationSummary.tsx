import { SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { Button, Input, Space, Table } from 'antd';
import type { ColumnType, ColumnsType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { useRef, useState } from 'react';
import { NormalizedResultForDataTable } from '../../types';
import Highlighter from 'react-highlight-words';

type DataIndex = keyof NormalizedResultForDataTable;

interface MisconfigurationSummaryProps {
    result: NormalizedResultForDataTable[];
}

const MisconfigurationSummary: React.FC<MisconfigurationSummaryProps> = ({ result }) => {
    console.log('MisconfigurationSummary:', result);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: DataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): ColumnType<NormalizedResultForDataTable> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button type="primary" onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)} icon={<SearchOutlined />} size="small" style={{ width: 90 }}>
                        Search
                    </Button>
                    <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys as string[])[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
        onFilter: (value, record) =>
            record
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} />
            ) : (
                text
            ),
    });

    const columns: ColumnsType<NormalizedResultForDataTable> = [
        {
            title: 'Target',
            dataIndex: 'Target',
            key: 'Target',
            width: '55%',
            ...getColumnSearchProps('Target'),
            sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Target.length - b.Target.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Type',
            dataIndex: 'Type',
            key: 'Type',
            width: '15%',
            ...getColumnSearchProps('Type'),
            sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => a.Type.length - b.Type.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Class',
            dataIndex: 'Class',
            key: 'Class',
            width: '15%',
            ...getColumnSearchProps('Class'),
            sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => (a.Class && b.Class ? a.Class.length - b.Class.length : 0),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Successes',
            dataIndex: 'Successes',
            key: 'Successes',
            width: '5%',
            ...getColumnSearchProps('Successes'),
            sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => (a.Successes && b.Successes ? a.Successes - b.Successes : 0),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Failures',
            dataIndex: 'Failures',
            key: 'Failures',
            width: '5%',
            ...getColumnSearchProps('Failures'),
            defaultSortOrder: 'descend',
            sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => (a.Failures && b.Failures ? a.Failures - b.Failures : 0),
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Exceptions',
            dataIndex: 'Exceptions',
            key: 'Exceptions',
            width: '5%',
            ...getColumnSearchProps('Exceptions'),
            defaultSortOrder: 'descend',
            sorter: (a: NormalizedResultForDataTable, b: NormalizedResultForDataTable) => (a.Exceptions && b.Exceptions ? a.Exceptions - b.Exceptions : 0),
            sortDirections: ['descend', 'ascend'],
        },
    ];

    return (
        <>
            <Table columns={columns} dataSource={result} pagination={{ defaultPageSize: 20 }} size="small" sticky />
        </>
    );
};

export default MisconfigurationSummary;
