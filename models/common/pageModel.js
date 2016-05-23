// 分页对象

module.exports = function(pageIndex, pageSize, recordTotal, pageTotal) {
	this.pageIndex = typeof pageIndex === "string" ? pageIndex : 1;
	this.pageSize = pageSize ? pageSize : 15;
	this.recordTotal = recordTotal ? recordTotal : 0;
	this.pageTotal = Math.ceil(recordTotal / pageSize) ? Math.ceil(recordTotal / pageSize) : 0;
}