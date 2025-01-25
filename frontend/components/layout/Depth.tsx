export const Depth = () => {
    return (
        <div>
            <TableHeader/>
        </div>
    )
}

function TableHeader()  {
    return (
        <div className="flex justify-between p-2 bg-black text-slate-100">
            <div>Price</div>
            <div>Size</div>
            <div>Total</div>
        </div>
    )
}