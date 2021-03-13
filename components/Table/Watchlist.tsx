import { Button, Popconfirm, TablePaginationConfig } from "antd";
import React from "react";
import { AuctionRecord, PersistedWatchlists } from "../../interfaces";
import { WatchTable } from ".";
import * as ls from "local-storage";
import { FilterValue, SorterResult } from "antd/lib/table/interface";
import { DeleteRowOutlined } from "@ant-design/icons";

type Props = {
    auctions: AuctionRecord[] | undefined;
    revalidate: () => Promise<boolean>;
    deleteWatchlist: (key: string) => void;
    id: string;
};

export const Watchlist: React.FunctionComponent<Props> = (props: Props) => {
    const { id, deleteWatchlist, revalidate, ...forwardProps } = props;

    const [pagination, setPagination] = React.useState<TablePaginationConfig>(
        {}
    );
    const [filters, setFilters] = React.useState<
        Record<string, FilterValue | null>
    >({});
    const [sorters, setSorters] = React.useState<SorterResult<AuctionRecord>>();

    const [isValidating, setIsValidating] = React.useState(false);

    const persisted = React.useMemo(() => {
        return (ls.get("watchlists") as PersistedWatchlists | undefined)?.[id];
    }, []);

    const revalidateWrapper = async () => {
        setIsValidating(true);
        await props.revalidate();
        setIsValidating(false);
    };

    React.useEffect(() => {
        setPagination(persisted?.pagination || {});
        setFilters(persisted?.filters || {});
        setSorters(persisted?.sorters);
    }, [persisted]);

    return (
        <WatchTable
            {...forwardProps}
            revalidate={revalidateWrapper}
            isValidating={isValidating}
            additionalButtons={
                <Popconfirm
                    title="Are you sure you want to delete this watchlist?"
                    onConfirm={() => deleteWatchlist(id)}
                    placement="topRight"
                >
                    <Button icon={<DeleteRowOutlined />} danger>
                        Delete
                    </Button>
                </Popconfirm>
            }
            pagination={pagination}
            filters={filters}
            sorters={sorters}
            clearFilters={() => setFilters({})}
            onTableChange={(pagination, filters, sorters) => {
                setPagination(pagination);
                setFilters(filters);
                setSorters(sorters as SorterResult<AuctionRecord>);
                const existing = ls.get("watchlists") as
                    | PersistedWatchlists
                    | undefined;
                if (existing) {
                    ls.set("watchlists", {
                        ...existing,
                        [id]: {
                            pagination,
                            filters,
                            sorters,
                        },
                    });
                } else {
                    ls.set("watchlists", {
                        [id]: {
                            pagination,
                            filters,
                            sorters,
                        },
                    });
                }
            }}
        />
    );
};