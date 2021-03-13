import {
    ClockCircleOutlined,
    ReloadOutlined,
    SearchOutlined,
    ClearOutlined,
} from "@ant-design/icons";
import {
    Button,
    Input,
    Row,
    Skeleton,
    Space,
    Statistic,
    Table,
    TablePaginationConfig,
    Tag,
    Tooltip,
} from "antd";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import React from "react";
import Highlighter from "react-highlight-words";
import ReactTimeAgo from "react-time-ago";
import { AuctionRecord } from "../../interfaces";

TimeAgo.addLocale(en);

const getTagColourFromTier = (
    tier: AuctionRecord["tier"]
): string | undefined => {
    switch (tier) {
        case "COMMON":
            return undefined;
        case "UNCOMMON":
            return "blue";
        case "RARE":
            return "geekblue";
        case "EPIC":
            return "purple";
        case "LEGENDARY":
            return "orange";
        case "MYTHIC":
            return "magenta";
        case "SPECIAL":
            return "lime";
        case "VERY SPECIAL":
            return "cyan";
        default:
            return undefined;
    }
};

const getTagColourFromCategory = (
    category: AuctionRecord["category"]
): string | undefined => {
    switch (category) {
        case "accessories":
            return "magenta";
        case "armor":
            return "cyan";
        case "blocks":
            return undefined;
        case "consumables":
            return "blue";
        case "misc":
            return "lime";
        case "weapon":
            return "volcano";
        default:
            return undefined;
    }
};

type Props = {
    auctions: AuctionRecord[] | undefined;
    isValidating: boolean;
    additionalButtons?: React.ReactNode;
    pagination?: TablePaginationConfig;
    filters?: Record<string, FilterValue | null>;
    sorters?: SorterResult<AuctionRecord>;
    setWatchingRecords?: (records: number[]) => void;
    setWatchModalVisible?: (value: boolean) => void;
    clearFilters: () => void;
    revalidate: () => Promise<void>;
    onTableChange?: (
        pagination: TablePaginationConfig,
        filters: Record<string, FilterValue | null>,
        sorter: SorterResult<AuctionRecord> | SorterResult<AuctionRecord>[]
    ) => void;
};

export const WatchTable: React.FunctionComponent<Props> = (props: Props) => {
    const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>(
        []
    );
    const [searchText, setSearchText] = React.useState<string>(
        props.filters?.["name"]?.[0].toString() || ""
    );
    const [showCountdown, setShowCountdown] = React.useState<boolean>(false);

    const columns = React.useMemo(() => {
        return [
            {
                title: "Type",
                dataIndex: "bin",
                key: "bin",
                render: (value: boolean) => (
                    <div>{value ? "Buy Instantly" : "Auction"}</div>
                ),
                filters: [
                    {
                        text: "Buy Instantly",
                        value: true,
                    },
                    {
                        text: "Auction",
                        value: false,
                    },
                ],
                filteredValue: props.filters?.["bin"] || null,
                onFilter: (
                    value: string | number | boolean,
                    record: AuctionRecord
                ) => record.bin === value,
            },
            {
                title: "Name",
                dataIndex: "item_name",
                key: "name",
                render: (text: string) => (
                    <a>
                        <Highlighter
                            autoEscape
                            highlightStyle={{
                                backgroundColor: "#ffc069",
                                padding: 0,
                            }}
                            searchWords={[searchText]}
                            textToHighlight={text}
                        />
                    </a>
                ),
                sortOrder:
                    (props.sorters?.columnKey === "name" &&
                        props.sorters.order) ||
                    undefined,
                sorter: (a: AuctionRecord, b: AuctionRecord) =>
                    a["item_name"].localeCompare(b["item_name"]),
                filteredValue: props.filters?.["name"] || null,
                filterIcon: (filtered: boolean) => (
                    <SearchOutlined
                        style={{ color: filtered ? "#1890ff" : undefined }}
                    />
                ),
                onFilter: (
                    value: string | number | boolean,
                    record: AuctionRecord
                ) =>
                    record["item_name"]
                        .toString()
                        .toLowerCase()
                        .includes(value.toString().toLowerCase()),
                filterDropdown: ({
                    setSelectedKeys,
                    selectedKeys,
                    confirm,
                    clearFilters,
                }: any) => (
                    <div style={{ padding: 8 }}>
                        <Input
                            ref={(node) => {
                                node?.focus();
                            }}
                            placeholder={"Fishing Rod"}
                            value={selectedKeys[0]}
                            onChange={(e) =>
                                setSelectedKeys(
                                    e.target.value ? [e.target.value] : []
                                )
                            }
                            onPressEnter={() => {
                                confirm();
                                setSearchText(selectedKeys[0]);
                            }}
                            style={{
                                width: 188,
                                marginBottom: 8,
                                display: "block",
                            }}
                        />
                        <Space>
                            <Button
                                type="primary"
                                onClick={() => {
                                    confirm();
                                    setSearchText(selectedKeys[0]);
                                }}
                                icon={<SearchOutlined />}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Search
                            </Button>
                            <Button
                                onClick={() => {
                                    clearFilters();
                                    setSearchText("");
                                }}
                                size="small"
                                style={{ width: 90 }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                ),
            },
            {
                title: "Bid",
                dataIndex: "highest_bid_amount",
                key: "bid",
                render: (text: string) => <p style={{ margin: 0 }}>{text}</p>,
                sortOrder:
                    (props.sorters?.columnKey === "bid" &&
                        props.sorters.order) ||
                    undefined,
                sorter: (a: AuctionRecord, b: AuctionRecord) =>
                    b["highest_bid_amount"] - a["highest_bid_amount"],
            },
            {
                title: "Ending",
                dataIndex: "end",
                key: "end",
                render: (value: number) => {
                    const date = new Date(value);
                    return (
                        <Tooltip title={date.toLocaleString()}>
                            <ReactTimeAgo key={Date.now()} date={date} />
                            {showCountdown && (
                                <Statistic.Countdown
                                    value={value}
                                    valueStyle={{
                                        fontSize: 12,
                                    }}
                                    style={{
                                        fontSize: 12,
                                    }}
                                />
                            )}
                        </Tooltip>
                    );
                },
                sortOrder:
                    (props.sorters?.columnKey === "end" &&
                        props.sorters.order) ||
                    undefined,
                sorter: (a: AuctionRecord, b: AuctionRecord) =>
                    b["end"] - a["end"],
                filters: [
                    { text: "Ended", value: true },
                    { text: "Active", value: false },
                ],
                filteredValue: props.filters?.["end"] || null,
                onFilter: (
                    value: string | number | boolean,
                    record: AuctionRecord
                ) =>
                    value ? record.end <= Date.now() : record.end > Date.now(),
            },
            {
                title: "Tier",
                dataIndex: "tier",
                key: "tier",
                render: (text: AuctionRecord["tier"]) => (
                    <Tag color={getTagColourFromTier(text)}>
                        {text.toUpperCase()}
                    </Tag>
                ),
                filters: [
                    {
                        text: "COMMON",
                        value: "COMMON",
                    },
                    {
                        text: "UNCOMMON",
                        value: "UNCOMMON",
                    },
                    {
                        text: "RARE",
                        value: "RARE",
                    },
                    {
                        text: "EPIC",
                        value: "EPIC",
                    },
                    {
                        text: "LEGENDARY",
                        value: "LEGENDARY",
                    },
                    {
                        text: "MYTHIC",
                        value: "MYTHIC",
                    },
                    {
                        text: "SPECIAL",
                        value: "SPECIAL",
                    },
                    {
                        text: "VERY SPECIAL",
                        value: "VERY SPECIAL",
                    },
                ],
                filteredValue: props.filters?.["tier"] || null,
                onFilter: (
                    value: string | number | boolean,
                    record: AuctionRecord
                ) => record.tier === value,
            },
            {
                title: "Category",
                dataIndex: "category",
                key: "category",
                render: (text: AuctionRecord["category"]) => (
                    <Tag color={getTagColourFromCategory(text)}>
                        {text.toUpperCase()}
                    </Tag>
                ),
                filters: [
                    {
                        text: "WEAPON",
                        value: "weapon",
                    },
                    {
                        text: "ARMOR",
                        value: "armor",
                    },
                    {
                        text: "ACCESSORY",
                        value: "accessories",
                    },
                    {
                        text: "CONSUMABLE",
                        value: "consumables",
                    },
                    {
                        text: "BLOCK",
                        value: "blocks",
                    },

                    {
                        text: "MISC",
                        value: "misc",
                    },
                ],
                filteredValue: props.filters?.["category"] || null,
                onFilter: (
                    value: string | number | boolean,
                    record: AuctionRecord
                ) => record.category === value,
            },
        ];
    }, [searchText, showCountdown, props.filters]);

    if (!props.auctions) {
        return <Skeleton active />;
    }

    return (
        <>
            <Space direction="vertical" style={{ width: "100%" }}>
                <Row justify={"space-between"}>
                    <Space>
                        {props.setWatchingRecords && (
                            <>
                                <Button
                                    type="primary"
                                    disabled={selectedRowKeys.length === 0}
                                    onClick={() => {
                                        props.setWatchingRecords?.([]);
                                        props.setWatchModalVisible?.(true);
                                    }}
                                >
                                    Watch
                                </Button>
                                <Button
                                    disabled={selectedRowKeys.length === 0}
                                    onClick={() => {
                                        setSelectedRowKeys([]);
                                    }}
                                >
                                    Clear {selectedRowKeys.length} selection
                                </Button>
                            </>
                        )}
                        <Button
                            icon={<ClearOutlined />}
                            onClick={props.clearFilters}
                        >
                            Clear all filters
                        </Button>
                    </Space>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={props.revalidate}
                            loading={props.isValidating}
                        />
                        <Button
                            icon={<ClockCircleOutlined />}
                            onClick={() => {
                                setShowCountdown((prev: boolean) => {
                                    return !prev;
                                });
                            }}
                        >{`${
                            showCountdown ? "Hide" : "Show"
                        } countdown`}</Button>
                        {props.additionalButtons}
                    </Space>
                </Row>
                <Table
                    expandable={{
                        rowExpandable: () => true,
                        expandedRowRender: (record: AuctionRecord) => (
                            <div>{record["item_lore"]}</div>
                        ),
                    }}
                    columns={columns}
                    dataSource={props.auctions}
                    rowSelection={
                        props.setWatchingRecords && {
                            selectedRowKeys,
                            onChange: setSelectedRowKeys,
                        }
                    }
                    onChange={props.onTableChange}
                    pagination={props.pagination}
                />
            </Space>
        </>
    );
};
