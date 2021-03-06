package cn.zzuzl.model.query;

/**
 * Created by Administrator on 2016/9/11.
 */
public abstract class BaseQuery {
    private Integer page;
    private Integer perPage;
    private Integer start;
    private String sortDir;
    private String sortField;

    public void adjust() {
        if (perPage != null) {
            if (page == null) {
                page = 1;
            }
            start = (page - 1) * perPage;
        }
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPerPage() {
        return perPage;
    }

    public void setPerPage(Integer perPage) {
        this.perPage = perPage;
    }

    public Integer getStart() {
        return start;
    }

    public void setStart(Integer start) {
        this.start = start;
    }

    public String getSortDir() {
        return sortDir;
    }

    public void setSortDir(String sortDir) {
        this.sortDir = sortDir;
    }

    public String getSortField() {
        return sortField;
    }

    public void setSortField(String sortField) {
        this.sortField = sortField;
    }
}
